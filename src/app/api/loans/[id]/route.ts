// import { NextResponse } from "next/server";
// import { getServerSession } from "next-auth";
// import { authOptions } from "@/lib/auth";
// import { loanService } from "@/lib/services/loan-service";

// type BookConditionType = 
//   | "EXCELLENT" 
//   | "GOOD" 
//   | "FAIR" 
//   | "DAMAGED" 
//   | "RESTORATION_NEEDED";

// interface UserSession {
//   id: string;
//   role: string;
//   email?: string;
//   name?: string;
// }

// interface RequestBody {
//   action?: string;
//   employeeId?: string;
//   dueDate?: string;
//   rejectionReason?: string;
//   conditionBefore?: string;
//   conditionAfter?: string;
//   employeeNotes?: string;
//   userId?: string;
// }

// // Helper functions
// const getUserId = (session: any, body: RequestBody): string => {
//   return body.userId || session.user.id;
// };

// const checkPermission = (user: UserSession): boolean => {
//   return ["EMPLOYEE", "ADMIN"].includes(user.role);
// };

// const validateRequiredField = (field: any, fieldName: string): NextResponse | null => {
//   if (!field) {
//     return NextResponse.json(
//       { error: `${fieldName} é obrigatório` },
//       { status: 400 }
//     );
//   }
//   return null;
// };

// // Validate BookConditionType - CORRIGIDO com os valores corretos
// const validateBookCondition = (condition: string): condition is BookConditionType => {
//   const validConditions: BookConditionType[] = [
//     "EXCELLENT", 
//     "GOOD", 
//     "FAIR", 
//     "DAMAGED", 
//     "RESTORATION_NEEDED"
//   ];
//   return validConditions.includes(condition as BookConditionType);
// };

// const handleApprove = async (loanId: string, body: RequestBody, user: UserSession) => {
//   const dueDate = body.dueDate ? new Date(body.dueDate) : undefined;
//   const employeeId = body.employeeId || user.id;

//   const updated = await loanService.approveLoan(loanId, employeeId, dueDate);
//   return NextResponse.json(updated, { status: 200 });
// };

// const handleReject = async (loanId: string, body: RequestBody, user: UserSession) => {
//   const rejectionReasonError = validateRequiredField(body.rejectionReason, "rejectionReason");
//   if (rejectionReasonError) return rejectionReasonError;

//   const employeeId = body.employeeId || user.id;

//   const updated = await loanService.rejectLoan(loanId, employeeId, body.rejectionReason!);
//   return NextResponse.json(updated, { status: 200 });
// };

// const handleWithdraw = async (loanId: string, body: RequestBody, user: UserSession) => {
//   const conditionBeforeError = validateRequiredField(body.conditionBefore, "conditionBefore");
//   if (conditionBeforeError) return conditionBeforeError;

//   // Validate condition type - CORRIGIDO com mensagem de erro atualizada
//   if (!validateBookCondition(body.conditionBefore!)) {
//     return NextResponse.json(
//       { error: "conditionBefore deve ser: EXCELLENT, GOOD, FAIR, DAMAGED ou RESTORATION_NEEDED" },
//       { status: 400 }
//     );
//   }

//   const employeeId = body.employeeId || user.id;

//   const updated = await loanService.registerLoanWithdrawal(
//     loanId,
//     employeeId,
//     body.conditionBefore! as BookConditionType,
//     body.employeeNotes
//   );
//   return NextResponse.json(updated, { status: 200 });
// };

// const handleReturn = async (loanId: string, body: RequestBody) => {
//   const conditionAfterError = validateRequiredField(body.conditionAfter, "conditionAfter");
//   if (conditionAfterError) return conditionAfterError;

//   // Validate condition type - CORRIGIDO com mensagem de erro atualizada
//   if (!validateBookCondition(body.conditionAfter!)) {
//     return NextResponse.json(
//       { error: "conditionAfter deve ser: EXCELLENT, GOOD, FAIR, DAMAGED ou RESTORATION_NEEDED" },
//       { status: 400 }
//     );
//   }

//   const updated = await loanService.registerReturn(
//     loanId,
//     body.conditionAfter! as BookConditionType,
//     body.employeeNotes
//   );
//   return NextResponse.json(updated, { status: 200 });
// };

// const handleCancel = async (loanId: string, body: RequestBody, user: UserSession, hasPermission: boolean) => {
//   const sessionUserId = user.id;
  
//   if (!hasPermission) {
//     // Usuário comum só pode cancelar seus próprios empréstimos
//     const userId = getUserId(user, body);
//     if (userId !== sessionUserId) {
//       return NextResponse.json({ error: "Permissão negada" }, { status: 403 });
//     }
    
//     const updated = await loanService.cancelLoan(loanId, userId);
//     return NextResponse.json(updated, { status: 200 });
//   } else {
//     // Funcionário/Admin pode cancelar qualquer empréstimo
//     const userId = getUserId(user, body) || sessionUserId;
//     const updated = await loanService.cancelLoan(loanId, userId);
//     return NextResponse.json(updated, { status: 200 });
//   }
// };

// // Main PATCH handler
// export async function PATCH(
//   request: Request,
//   { params }: { params: { id: string } }
// ) {
//   try {
//     const session = await getServerSession(authOptions);

//     if (!session?.user) {
//       return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
//     }

//     const user = session.user as UserSession;
//     const loanId = params.id;
    
//     if (!loanId) {
//       return NextResponse.json({ error: "ID do empréstimo ausente" }, { status: 400 });
//     }

//     const body: RequestBody = await request.json().catch(() => ({}));
//     const action = (body.action || "").toString();
//     const hasPermission = checkPermission(user);

//     // Permission check for employee/admin actions
//     const employeeActions = ["approve", "reject", "withdraw", "return"];
//     if (employeeActions.includes(action) && !hasPermission) {
//       return NextResponse.json({ error: "Permissão negada" }, { status: 403 });
//     }

//     // Route actions
//     switch (action) {
//       case "approve":
//         return await handleApprove(loanId, body, user);
      
//       case "reject":
//         return await handleReject(loanId, body, user);
      
//       case "withdraw":
//         return await handleWithdraw(loanId, body, user);
      
//       case "return":
//         return await handleReturn(loanId, body);
      
//       case "cancel":
//         return await handleCancel(loanId, body, user, hasPermission);

//       default:
//         return NextResponse.json({
//           error: "Ação inválida. Use approve, reject, withdraw, return ou cancel"
//         }, { status: 400 });
//     }

//   } catch (error: any) {
//     console.error("PATCH /api/loans/:id error:", error);
    
//     // Handle known service errors
//     if (error?.message && typeof error.message === 'string') {
//       return NextResponse.json(
//         { error: error.message },
//         { status: 400 }
//       );
//     }

//     return NextResponse.json(
//       { error: "Erro interno do servidor" },
//       { status: 500 }
//     );
//   }
// }

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { loanService } from "@/lib/services/loan-service";

type BookConditionType = 
  | "EXCELLENT" 
  | "GOOD" 
  | "FAIR" 
  | "DAMAGED" 
  | "RESTORATION_NEEDED";

interface UserSession {
  id: string;
  role: string;
  email?: string;
  name?: string;
}

interface RequestBody {
  action?: string;
  employeeId?: string;
  dueDate?: string;
  rejectionReason?: string;
  conditionBefore?: string;
  conditionAfter?: string;
  employeeNotes?: string;
  userId?: string;
}

interface RouteContext {
  params: Promise<{ id: string }>;
}

// Helper functions
const getUserId = (session: any, body: RequestBody): string => {
  return body.userId || session.user.id;
};

const checkPermission = (user: UserSession): boolean => {
  return ["EMPLOYEE", "ADMIN"].includes(user.role);
};

const validateRequiredField = (field: any, fieldName: string): NextResponse | null => {
  if (!field) {
    return NextResponse.json(
      { error: `${fieldName} é obrigatório` },
      { status: 400 }
    );
  }
  return null;
};

// Validate BookConditionType
const validateBookCondition = (condition: string): condition is BookConditionType => {
  const validConditions: BookConditionType[] = [
    "EXCELLENT", 
    "GOOD", 
    "FAIR", 
    "DAMAGED", 
    "RESTORATION_NEEDED"
  ];
  return validConditions.includes(condition as BookConditionType);
};

const handleApprove = async (loanId: string, body: RequestBody, user: UserSession) => {
  const dueDate = body.dueDate ? new Date(body.dueDate) : undefined;
  const employeeId = body.employeeId || user.id;

  const updated = await loanService.approveLoan(loanId, employeeId, dueDate);
  return NextResponse.json(updated, { status: 200 });
};

const handleReject = async (loanId: string, body: RequestBody, user: UserSession) => {
  const rejectionReasonError = validateRequiredField(body.rejectionReason, "rejectionReason");
  if (rejectionReasonError) return rejectionReasonError;

  const employeeId = body.employeeId || user.id;

  const updated = await loanService.rejectLoan(loanId, employeeId, body.rejectionReason!);
  return NextResponse.json(updated, { status: 200 });
};

const handleWithdraw = async (loanId: string, body: RequestBody, user: UserSession) => {
  const conditionBeforeError = validateRequiredField(body.conditionBefore, "conditionBefore");
  if (conditionBeforeError) return conditionBeforeError;

  if (!validateBookCondition(body.conditionBefore!)) {
    return NextResponse.json(
      { error: "conditionBefore deve ser: EXCELLENT, GOOD, FAIR, DAMAGED ou RESTORATION_NEEDED" },
      { status: 400 }
    );
  }

  const employeeId = body.employeeId || user.id;

  const updated = await loanService.registerLoanWithdrawal(
    loanId,
    employeeId,
    body.conditionBefore! as BookConditionType,
    body.employeeNotes
  );
  return NextResponse.json(updated, { status: 200 });
};

const handleReturn = async (loanId: string, body: RequestBody) => {
  const conditionAfterError = validateRequiredField(body.conditionAfter, "conditionAfter");
  if (conditionAfterError) return conditionAfterError;

  if (!validateBookCondition(body.conditionAfter!)) {
    return NextResponse.json(
      { error: "conditionAfter deve ser: EXCELLENT, GOOD, FAIR, DAMAGED ou RESTORATION_NEEDED" },
      { status: 400 }
    );
  }

  const updated = await loanService.registerReturn(
    loanId,
    body.conditionAfter! as BookConditionType,
    body.employeeNotes
  );
  return NextResponse.json(updated, { status: 200 });
};

const handleCancel = async (loanId: string, body: RequestBody, user: UserSession, hasPermission: boolean) => {
  const sessionUserId = user.id;
  
  if (!hasPermission) {
    const userId = getUserId(user, body);
    if (userId !== sessionUserId) {
      return NextResponse.json({ error: "Permissão negada" }, { status: 403 });
    }
    
    const updated = await loanService.cancelLoan(loanId, userId);
    return NextResponse.json(updated, { status: 200 });
  } else {
    const userId = getUserId(user, body) || sessionUserId;
    const updated = await loanService.cancelLoan(loanId, userId);
    return NextResponse.json(updated, { status: 200 });
  }
};

// Main PATCH handler
export async function PATCH(
  request: Request,
  context: RouteContext
) {
  try {
    const params = await context.params;
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const user = session.user as UserSession;
    const loanId = params.id;
    
    if (!loanId) {
      return NextResponse.json({ error: "ID do empréstimo ausente" }, { status: 400 });
    }

    const body: RequestBody = await request.json().catch(() => ({}));
    const action = (body.action || "").toString();
    const hasPermission = checkPermission(user);

    const employeeActions = ["approve", "reject", "withdraw", "return"];
    if (employeeActions.includes(action) && !hasPermission) {
      return NextResponse.json({ error: "Permissão negada" }, { status: 403 });
    }

    switch (action) {
      case "approve":
        return await handleApprove(loanId, body, user);
      
      case "reject":
        return await handleReject(loanId, body, user);
      
      case "withdraw":
        return await handleWithdraw(loanId, body, user);
      
      case "return":
        return await handleReturn(loanId, body);
      
      case "cancel":
        return await handleCancel(loanId, body, user, hasPermission);

      default:
        return NextResponse.json({
          error: "Ação inválida. Use approve, reject, withdraw, return ou cancel"
        }, { status: 400 });
    }

  } catch (error: any) {
    console.error("PATCH /api/loans/:id error:", error);
    
    if (error?.message && typeof error.message === 'string') {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}