// import { NextRequest, NextResponse } from "next/server";
// import { getServerSession } from "next-auth";
// import { authOptions } from "@/lib/auth";
// import { reviewServiceServer } from "@/lib/services/review-service-server";

// interface RouteParams {
//     params: {
//         id: string;
//     }
// }

// // Get - Busca todas as informações de um usuario
// export async function GET(request: NextRequest, { params } : RouteParams) {
//     try {
//         const session = await getServerSession(authOptions);

//         if (!session?.user?.id) {
//             return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
//         }

//         if (session.user.id !== params.id) {
//             return NextResponse.json({ error: 'Não autorizado'}, { status: 403})
//         }

//         const reviews = await reviewServiceServer.getUserAllReviews(params.id);

//         return NextResponse.json(reviews)

//     } catch (error) {
//         console.error('Erro ao buscar observações do usuário:', error)
//         return NextResponse.json(
//             {error: 'Erro interno do servidor'},
//             { status: 500}
//         )
//     }
// }


import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { reviewServiceServer } from "@/lib/services/review-service-server";

// Get - Busca todas as informações de um usuario
export async function GET(
  request: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    if (session.user.id !== id) {
      return NextResponse.json({ error: 'Não autorizado'}, { status: 403})
    }

    const reviews = await reviewServiceServer.getUserAllReviews(id);

    return NextResponse.json(reviews)

  } catch (error) {
    console.error('Erro ao buscar observações do usuário:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
