import { PrismaClient, LoanStatus, BookConditionType, UserRole, NotificationType } from "@prisma/client"

const prisma = new PrismaClient();

export interface CreateLoanInput {
    bookId: string;
    userId: string;
    userNotes?: string;
}

export interface UpdateLoanInput {
    approvedAt?: Date;
    loanDate?: Date;
    dueDate?: Date;
    returnedAt?: Date;
    status?: LoanStatus;
    conditionAfter?: BookConditionType;
    employeeNotes?: string;
    rejectionReason?: string;
    approvedById?: string;
}

export class LoanService {
    // criar solicitação de empréstimo (cliente)
    async createLoan(data: CreateLoanInput) {
        try {
            // verifica se o livro existe e está disponivel
            const book = await prisma.book.findUnique({
                where: { id: data.bookId },
                select: {
                    id: true,
                    available_copies: true,
                    total_copies: true,
                    title: true
                }
            });

            if (!book) {
               throw new Error('Livro não encontrado.')
            }

            if (book.available_copies <= 0) {
                throw new Error('Livro indisponivel para empréstimo.')
            }

            // verifica se o usuário já tem empréstimo ativo para este livro
            const existingActiveLoan = await prisma.loan.findFirst({
                where: {
                    bookId: data.bookId,
                    userId: data.userId,
                    status: {
                        in: [LoanStatus.PENDING, LoanStatus.APPROVED, LoanStatus.ACTIVE]
                    }
                }
            })

            if (existingActiveLoan) {
               throw new Error('Você já tem empréstimo ativo ou pendente para este livro.')
            }

            // verifica se o usuario tem empréstimos em atraso
            const overdueLoans = await prisma.loan.count({
                where: {
                    userId: data.userId,
                    status: LoanStatus.OVERDUE
                }
            })

            if (overdueLoans > 0) {
                throw new Error('Você tem empréstimos em atraso. Regularize-os antes de solicitar novo empréstimo.')
                
            }

            // Criar empréstimo
            const loan = await prisma.loan.create({
                data: {
                    bookId: data.bookId,
                    userId: data.userId,
                    userNotes: data.userNotes,
                    status: LoanStatus.PENDING,
                    //requestedAt: new Date(),
                },
                include: {
                    book: {
                        select: {
                            title: true,
                            author: true,
                            cover: true
                        }
                    },
                    user: {
                        select: {
                            name: true,
                            email: true
                        }
                    }
                }
            }) 

            // cria notificação para funcionarios
            await this.createNotification({
                userId: data.userId,
                title: 'Solicitação de Empréstimo Enviada',
                message: `Sua solicitação para o livro "${loan.book.title}" foi enviada e está em análise.`,
                type: NotificationType.SYSTEM,
                relatedLoanId: loan.id
            })

            // Notificar funcionários 
      const employees = await prisma.user.findMany({
        where: {
          role: {
            in: [UserRole.EMPLOYEE, UserRole.ADMIN]
          },
          status: 'ACTIVE'
        },
        take: 1
      });

      if (employees.length > 0) {
        await this.createNotification({
          userId: employees[0].id,
          title: 'Nova Solicitação de Empréstimo',
          message: `O usuário ${loan.user.name} solicitou o livro "${loan.book.title}".`,
          type: NotificationType.NEW_LOAN_REQUEST,
          relatedLoanId: loan.id
        });
      }

      return loan;

    } catch (error) {
      console.error('Erro ao criar empréstimo:', error);
      throw error;
    }
  }

  //APROVAR EMPRÉSTIMO (FUNCIONÁRIO/ADMIN)
  async approveLoan(loanId: string, employeeId: string, dueDate?: Date) {
    try {
      const existingLoan = await prisma.loan.findUnique({
        where: { id: loanId },
        include: { book: true }
      });

      if (!existingLoan) {
        throw new Error('Empréstimo não encontrado');
      }

      if (existingLoan.status !== LoanStatus.PENDING) {
        throw new Error('Esta solicitação já foi processada');
      }

      // Verificar disponibilidade do livro novamente
      if (existingLoan.book.available_copies <= 0) {
        throw new Error('Livro não está mais disponível');
      }

      // Calcular data de devolução padrão (14 dias) se não for fornecida
      const calculatedDueDate = dueDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

      const updatedLoan = await prisma.$transaction(async (tx) => {
        // Atualizar empréstimo
        const updateLoanTransaction = await tx.loan.update({
          where: { id: loanId },
          data: {
            status: LoanStatus.APPROVED,
            approvedAt: new Date(),
            approvedById: employeeId,
            dueDate: calculatedDueDate,
          },
          include: {
            book: {
              select: {
                title: true,
                author: true
              }
            },
            user: {
              select: {
                name: true,
                email: true,
                id: true
              }
            }
          }
        });

        // Atualizar contador de cópias disponíveis
        await tx.book.update({
          where: { id: existingLoan.bookId },
          data: {
            available_copies: {
              decrement: 1
            }
          }
        });

        return updateLoanTransaction;
      });

      // Notificar cliente
      await this.createNotification({
        userId: updatedLoan.user.id,
        title: 'Empréstimo Aprovado!',
        message: `Sua solicitação para o livro "${updatedLoan.book.title}" foi aprovada. Você tem até ${calculatedDueDate.toLocaleDateString('pt-BR')} para retirar o livro.`,
        type: NotificationType.LOAN_APPROVED,
        relatedLoanId: updatedLoan.id
      });

      return updatedLoan;

    } catch (error) {
      console.error('Erro ao aprovar empréstimo:', error);
      throw error;
    }
  }

  // REGISTRAR RETIRADA (FUNCIONÁRIO/ADMIN)
  async registerLoanWithdrawal(loanId: string, employeeId: string, conditionBefore: BookConditionType, employeeNotes?: string) {
    try {
      const existingLoan = await prisma.loan.findUnique({
        where: { id: loanId }
      });

      if (!existingLoan) {
        throw new Error('Empréstimo não encontrado');
      }

      if (existingLoan.status !== LoanStatus.APPROVED) {
        throw new Error('Empréstimo não está aprovado para retirada');
      }

      const updatedLoan = await prisma.loan.update({
        where: { id: loanId },
        data: {
          status: LoanStatus.ACTIVE,
          loanDate: new Date(),
          conditionBefore: conditionBefore,
          employeeNotes: employeeNotes,
          approvedById: employeeId, 
        },
        include: {
          book: {
            select: {
              title: true,
              author: true
            }
          },
          user: {
            select: {
              name: true,
              id: true
            }
          }
        }
      });

      // Notificar cliente
      await this.createNotification({
        userId: updatedLoan.user.id,
        title: 'Livro Retirado',
        message: `O livro "${updatedLoan.book.title}" foi registrado como retirado. Data de devolução: ${existingLoan.dueDate?.toLocaleDateString('pt-BR')}.`,
        type: NotificationType.SYSTEM,
        relatedLoanId: updatedLoan.id
      });

      return updatedLoan;

    } catch (error) {
      console.error('Erro ao registrar retirada:', error);
      throw error;
    }
  }

  //REGISTRAR DEVOLUÇÃO (FUNCIONÁRIO/ADMIN)
  async registerReturn(loanId: string, conditionAfter: BookConditionType, employeeNotes?: string) {
    try {
      const existingLoan = await prisma.loan.findUnique({
        where: { id: loanId },
        include: { book: true }
      });

      if (!existingLoan) {
        throw new Error('Empréstimo não encontrado');
      }

      if (existingLoan.status !== LoanStatus.ACTIVE && existingLoan.status !== LoanStatus.OVERDUE) {
        throw new Error('Empréstimo não está ativo para devolução');
      }

      const returnedAt = new Date();


      const updatedLoan = await prisma.$transaction(async (tx) => {
        // Atualizar empréstimo
        const returnedLoan = await tx.loan.update({
          where: { id: loanId },
          data: {
            status: LoanStatus.RETURNED,
            returnedAt: returnedAt,
            conditionAfter: conditionAfter,
            employeeNotes: employeeNotes ? 
              (existingLoan.employeeNotes ? `${existingLoan.employeeNotes}\n---\n${employeeNotes}` : employeeNotes) 
              : existingLoan.employeeNotes
          },
          include: {
            book: {
              select: {
                title: true,
                author: true
              }
            },
            user: {
              select: {
                name: true,
                id: true
              }
            }
          }
        });

        // Atualizar contador de cópias disponíveis
        await tx.book.update({
          where: { id: existingLoan.bookId },
          data: {
            available_copies: {
              increment: 1
            }
          }
        });

        return returnedLoan;
      });

      // Notificar cliente
      await this.createNotification({
        userId: updatedLoan.user.id,
        title: 'Devolução Confirmada',
        message: `A devolução do livro "${updatedLoan.book.title}" foi registrada com sucesso. Obrigado!`,
        type: 'RETURN_CONFIRMATION',
        relatedLoanId: updatedLoan.id
      });

      return updatedLoan;

    } catch (error) {
      console.error('Erro ao registrar devolução:', error);
      throw error;
    }
  }

  // 🚫 REJEITAR EMPRÉSTIMO (FUNCIONÁRIO/ADMIN)
  async rejectLoan(loanId: string, employeeId: string, rejectionReason: string) {
    try {
      const loan = await prisma.loan.findUnique({
        where: { id: loanId }
      });

      if (!loan) {
        throw new Error('Empréstimo não encontrado');
      }

      if (loan.status !== LoanStatus.PENDING) {
        throw new Error('Esta solicitação já foi processada');
      }

      const updatedLoan = await prisma.loan.update({
        where: { id: loanId },
        data: {
          status: LoanStatus.REJECTED,
          approvedAt: new Date(),
          approvedById: employeeId,
          rejectionReason: rejectionReason,
        },
        include: {
          book: {
            select: {
              title: true,
              author: true
            }
          },
          user: {
            select: {
              name: true,
              id: true
            }
          }
        }
      });

      // Notificar cliente
      await this.createNotification({
        userId: updatedLoan.user.id,
        title: 'Solicitação de Empréstimo Rejeitada',
        message: `Sua solicitação para o livro "${updatedLoan.book.title}" foi rejeitada. Motivo: ${rejectionReason}`,
        type: 'LOAN_REJECTED',
        relatedLoanId: updatedLoan.id
      });

      return updatedLoan;

    } catch (error) {
      console.error('Erro ao rejeitar empréstimo:', error);
      throw error;
    }
  }

  // ❌ CANCELAR SOLICITAÇÃO (CLIENTE)
  async cancelLoan(loanId: string, userId: string) {
    try {
      const loan = await prisma.loan.findUnique({
        where: { id: loanId }
      });

      if (!loan) {
        throw new Error('Empréstimo não encontrado');
      }

      if (loan.userId !== userId) {
        throw new Error('Você não tem permissão para cancelar este empréstimo');
      }

      if (loan.status !== LoanStatus.PENDING) {
        throw new Error('Só é possível cancelar solicitações pendentes');
      }

      const updatedLoan = await prisma.loan.update({
        where: { id: loanId },
        data: {
          status: LoanStatus.CANCELLED,
        },
        include: {
          book: {
            select: {
              title: true,
              author: true
            }
          }
        }
      });

      // Notificar funcionários
      const employees = await prisma.user.findMany({
        where: {
          role: {
            in: [UserRole.EMPLOYEE, UserRole.ADMIN]
          },
          status: 'ACTIVE'
        },
        take: 1
      });

      if (employees.length > 0) {
        await this.createNotification({
          userId: employees[0].id,
          title: 'Solicitação Cancelada',
          message: `O usuário cancelou a solicitação do livro "${updatedLoan.book.title}".`,
          type: 'LOAN_CANCELLED',
          relatedLoanId: updatedLoan.id
        });
      }

      return updatedLoan;

    } catch (error) {
      console.error('Erro ao cancelar empréstimo:', error);
      throw error;
    }
  }

  // 📊 LISTAR EMPRÉSTIMOS POR USUÁRIO
  async getUserLoans(userId: string, status?: LoanStatus) {
    try {
      const whereClause: any = { userId };
      
      if (status) {
        whereClause.status = status;
      }

      const loans = await prisma.loan.findMany({
        where: whereClause,
        include: {
          book: {
            select: {
              title: true,
              author: true,
              cover: true,
              isbn: true
            }
          },
          approvedBy: {
            select: {
              name: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      return loans;

    } catch (error) {
      console.error('Erro ao buscar empréstimos do usuário:', error);
      throw error;
    }
  }

  // 📋 LISTAR TODOS OS EMPRÉSTIMOS (FUNCIONÁRIO/ADMIN)
  async getAllLoans(status?: LoanStatus, page: number = 1, limit: number = 10) {
    try {
      const whereClause: any = {};
      
      if (status) {
        whereClause.status = status;
      }

      const skip = (page - 1) * limit;

      const [loans, total] = await Promise.all([
        prisma.loan.findMany({
          where: whereClause,
          include: {
            book: {
              select: {
                title: true,
                author: true,
                cover: true
              }
            },
            user: {
              select: {
                name: true,
                email: true,
                registration_number: true
              }
            },
            approvedBy: {
              select: {
                name: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          },
          skip,
          take: limit
        }),
        prisma.loan.count({ where: whereClause })
      ]);

      return {
        loans,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      };

    } catch (error) {
      console.error('Erro ao buscar todos os empréstimos:', error);
      throw error;
    }
  }

  // 🔍 BUSCAR EMPRÉSTIMO POR ID
  async getLoanById(loanId: string) {
    try {
      const loan = await prisma.loan.findUnique({
        where: { id: loanId },
        include: {
          book: {
            select: {
              title: true,
              author: true,
              cover: true,
              isbn: true,
              year: true
            }
          },
          user: {
            select: {
              name: true,
              email: true,
              phone: true,
              registration_number: true
            }
          },
          approvedBy: {
            select: {
              name: true,
              email: true
            }
          }
        }
      });

      if (!loan) {
        throw new Error('Empréstimo não encontrado');
      }

      return loan;

    } catch (error) {
      console.error('Erro ao buscar empréstimo:', error);
      throw error;
    }
  }

  // ⚠️ ATUALIZAR EMPRÉSTIMOS ATRASADOS (CRON JOB)
  async updateOverdueLoans() {
    try {
      const now = new Date();
      
      const result = await prisma.loan.updateMany({
        where: {
          status: LoanStatus.ACTIVE,
          dueDate: {
            lt: now
          }
        },
        data: {
          status: LoanStatus.OVERDUE
        }
      });

      // Buscar empréstimos que foram marcados como atrasados para notificar
      if (result.count > 0) {
        const overdueLoans = await prisma.loan.findMany({
          where: {
            status: LoanStatus.OVERDUE,
            dueDate: {
              lt: now
            }
          },
          include: {
            user: {
              select: {
                id: true,
                name: true
              }
            },
            book: {
              select: {
                title: true
              }
            }
          }
        });

        // Enviar notificações para cada usuário
        for (const loan of overdueLoans) {
          await this.createNotification({
            userId: loan.user.id,
            title: 'Empréstimo Atrasado',
            message: `O empréstimo do livro "${loan.book.title}" está em atraso. Por favor, regularize a situação.`,
            type: 'LOAN_OVERDUE',
            relatedLoanId: loan.id
          });
        }
      }

      return result.count;

    } catch (error) {
      console.error('Erro ao atualizar empréstimos atrasados:', error);
      throw error;
    }
  }

  // 🔔 MÉTODO AUXILIAR PARA CRIAR NOTIFICAÇÕES
  private async createNotification(data: {
    userId: string;
    title: string;
    message: string;
    type: any;
    relatedLoanId?: string;
  }) {
    try {
      await prisma.notification.create({
        data: {
          userId: data.userId,
          title: data.title,
          message: data.message,
          type: data.type,
          relatedLoanId: data.relatedLoanId,
        }
      });
    } catch (error) {
      console.error('Erro ao criar notificação:', error);
      // Não lançar erro para não quebrar o fluxo principal
    }
  }
}

export const loanService = new LoanService();