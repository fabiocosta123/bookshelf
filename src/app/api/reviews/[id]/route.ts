// import { NextResponse } from 'next/server';
// import { getServerSession } from 'next-auth';
// import { authOptions } from '@/lib/auth';
// import { reviewServiceServer } from '@/lib/services/review-service-server';

// interface RouteParams {
//   params: {
//     id: string;
//   };
// }

// // GET /api/reviews/[id] - Buscar observação específica
// export async function GET(request: Request, { params }: RouteParams) {
//   try {
//     const session = await getServerSession(authOptions);

//     if (!session?.user?.id) {
//       return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
//     }

//     const review = await reviewServiceServer.getReviewById(params.id);

//     if (!review) {
//       return NextResponse.json(
//         { error: 'Observação não encontrada' },
//         { status: 404 }
//       );
//     }

//     // Só o dono da observação pode ver (se for privada)
//     if (review.isPrivate && review.userId !== session.user.id) {
//       return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
//     }

//     return NextResponse.json(review);
//   } catch (error) {
//     console.error('Erro ao buscar observação:', error);
//     return NextResponse.json(
//       { error: 'Erro interno do servidor' },
//       { status: 500 }
//     );
//   }
// }

// // PUT /api/reviews/[id] - Atualizar observação
// export async function PUT(request: Request, { params }: RouteParams) {
//   try {
//     const session = await getServerSession(authOptions);

//     if (!session?.user?.id) {
//       return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
//     }

//     const body = await request.json();
//     const { content, page, isPrivate } = body;

//     if (!content) {
//       return NextResponse.json(
//         { error: 'Conteúdo é obrigatório' },
//         { status: 400 }
//       );
//     }

//     const review = await reviewServiceServer.updateReview(
//       params.id,
//       session.user.id,
//       {
//         content,
//         page: page ? Number(page) : undefined,
//         isPrivate
//       }
//     );

//     return NextResponse.json(review);
//   } catch (error) {
//     console.error('Erro ao atualizar observação:', error);
    
//     if (error instanceof Error) {
//       if (error.message.includes('não tem permissão')) {
//         return NextResponse.json(
//           { error: error.message },
//           { status: 403 }
//         );
//       }
//       if (error.message.includes('não encontrada')) {
//         return NextResponse.json(
//           { error: error.message },
//           { status: 404 }
//         );
//       }
//     }

//     return NextResponse.json(
//       { error: 'Erro interno do servidor' },
//       { status: 500 }
//     );
//   }
// }

// // DELETE /api/reviews/[id] - Excluir observação
// export async function DELETE(request: Request, { params }: RouteParams) {
//   try {
//     const session = await getServerSession(authOptions);

//     if (!session?.user?.id) {
//       return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
//     }

//     await reviewServiceServer.deleteReview(params.id, session.user.id);

//     return NextResponse.json(
//       { message: 'Observação excluída com sucesso' },
//       { status: 200 }
//     );
//   } catch (error) {
//     console.error('Erro ao excluir observação:', error);
    
//     if (error instanceof Error) {
//       if (error.message.includes('não tem permissão')) {
//         return NextResponse.json(
//           { error: error.message },
//           { status: 403 }
//         );
//       }
//       if (error.message.includes('não encontrada')) {
//         return NextResponse.json(
//           { error: error.message },
//           { status: 404 }
//         );
//       }
//     }

//     return NextResponse.json(
//       { error: 'Erro interno do servidor' },
//       { status: 500 }
//     );
//   }
// }


import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

import type { Session } from 'next-auth'; 
import { authOptions } from '@/lib/auth';
import { reviewServiceServer } from '@/lib/services/review-service-server';


// Tipagem para o corpo da requisição PUT
interface UpdateReviewBody {
    content: string;
    page?: number | string;
    isPrivate?: boolean;
}

// --- FUNÇÕES DE ROTA ---

// GET /api/reviews/[id] - Buscar observação específica
export async function GET(
    request: Request, 
    { params } : any
) {
    try {
        // Tipagem segura para a sessão
        const session = await getServerSession(authOptions) as Session | null; 

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
        }

        const review = await reviewServiceServer.getReviewById(params.id);

        if (!review) {
            return NextResponse.json(
                { error: 'Observação não encontrada' },
                { status: 404 }
            );
        }

        // Só o dono da observação pode ver (se for privada)
        if (review.isPrivate && review.userId !== session.user.id) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
        }

        return NextResponse.json(review);
    } catch (error) {
        console.error('Erro ao buscar observação:', error);
        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        );
    }
}

// PUT /api/reviews/[id] - Atualizar observação
export async function PUT(
    request: Request, 
    { params }: any 
) {
    try {
        const session = await getServerSession(authOptions) as Session | null;

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
        }

        const body: Partial<UpdateReviewBody> = await request.json();
        const { content, page, isPrivate } = body;

        if (!content) {
            return NextResponse.json(
                { error: 'Conteúdo é obrigatório' },
                { status: 400 }
            );
        }

        const review = await reviewServiceServer.updateReview(
            params.id,
            session.user.id,
            {
                content,
                // Garantir que 'page' seja número ou undefined
                page: page ? Number(page) : undefined, 
                isPrivate
            }
        );

        return NextResponse.json(review);
    } catch (error) {
        console.error('Erro ao atualizar observação:', error);
        
        // Tratamento de erro aprimorado
        if (error instanceof Error) {
            if (error.message.includes('não tem permissão')) {
                return NextResponse.json(
                    { error: error.message },
                    { status: 403 }
                );
            }
            if (error.message.includes('não encontrada')) {
                return NextResponse.json(
                    { error: error.message },
                    { status: 404 }
                );
            }
        }

        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        );
    }
}

// DELETE /api/reviews/[id] - Excluir observação
export async function DELETE(
    request: Request, 
    { params }: any
) {
    try {
        const session = await getServerSession(authOptions) as Session | null;

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
        }

        await reviewServiceServer.deleteReview(params.id, session.user.id);

        return NextResponse.json(
            { message: 'Observação excluída com sucesso' },
            { status: 200 }
        );
    } catch (error) {
        console.error('Erro ao excluir observação:', error);
        
        // Tratamento de erro aprimorado
        if (error instanceof Error) {
            if (error.message.includes('não tem permissão')) {
                return NextResponse.json(
                    { error: error.message },
                    { status: 403 }
                );
            }
            if (error.message.includes('não encontrada')) {
                return NextResponse.json(
                    { error: error.message },
                    { status: 404 }
                );
            }
        }

        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        );
    }
}