// // import { NextResponse } from "next/server";
// // import { bookServiceServer } from "@/lib/services/book-service-server";
// // import { ReadingStatus } from "@prisma/client";

// // interface RouteParams {
// //   params: {
// //     id: string;
// //   };
// // }

// // // GET /api/books/:id => buscar um livro pelo ID
// // export async function GET(request: Request, { params }: RouteParams) {
// //   try {
// //     const book = await bookServiceServer.getBookById(params.id);

// //     if (!book) {
// //       return NextResponse.json(
// //         { error: "Livro não encontrado" },
// //         { status: 404 }
// //       );
// //     }

// //     return NextResponse.json(book, { status: 200 });
// //   } catch (error) {
// //     console.error("Erro ao buscar livro:", error);
// //     return NextResponse.json(
// //       { error: "Erro interno do servidor" },
// //       { status: 500 }
// //     );
// //   }
// // }

// // // PUT /api/books/:id => atualizar um livro pelo ID
// // export async function PUT(request: Request, { params }: RouteParams) {
// //   try {
// //     const body = await request.json();

// //     const {
// //       title,
// //       author,
// //       genre,
// //       year,
// //       pages,
// //       total_copies,
// //       rating,
// //       synopsis,
// //       cover,
// //       reading_status,
// //       isbn,
// //     } = body;

// //     // Validação básica
// //     if (!title || !author) {
// //       return NextResponse.json(
// //         { error: "Título e autor são obrigatórios" },
// //         { status: 400 }
// //       );
// //     }

// //     const book = await bookServiceServer.updateBook(params.id, {
// //       title,
// //       author,
// //       genre,
// //       year: year ? Number(year) : undefined,
// //       pages: pages ? Number(pages) : undefined,
// //       total_copies: Number(total_copies) || 1,
// //       available_copies: Number(total_copies) || 1,
// //       rating: rating ? Number(rating) : undefined,
// //       synopsis,
// //       cover,
// //       reading_status: reading_status as ReadingStatus,
// //       isbn,
// //     });

// //     return NextResponse.json(book);
// //   } catch (error) {
// //     console.error("Erro ao atualizar livro:", error);
// //     return NextResponse.json(
// //       { error: "Erro interno do servidor" },
// //       { status: 500 }
// //     );
// //   }
// // }

// // // DELETE /api/books/:id => excluir um livro pelo ID
// // export async function DELETE(request: Request, { params }: RouteParams) {
// //   try {
// //     // Verificar se o livro existe
// //     const book = await bookServiceServer.getBookById(params.id);

// //     if (!book) {
// //       return NextResponse.json(
// //         { error: "Livro não encontrado" },
// //         { status: 404 }
// //       );
// //     }

// //     // Excluir o livro
// //     await bookServiceServer.deleteBook(params.id);

// //     return NextResponse.json(
// //       {
// //         message: "Livro excluído com sucesso",
// //         deletedBook: book,
// //       },
// //       { status: 200 }
// //     );
// //   } catch (error) {
// //     console.error("Erro ao excluir livro:", error);
// //     return NextResponse.json(
// //       { error: "Erro interno do servidor" },
// //       { status: 500 }
// //     );
// //   }
// // }


// import { NextResponse } from "next/server"; // NextRequest foi removido
// import { bookServiceServer } from "@/lib/services/book-service-server";
// import { ReadingStatus } from "@prisma/client";

// // Tipagem simplificada para o que realmente está dentro de 'params'
// interface ParamsContext {
//   id: string; 
// }

// // GET /api/books/:id => buscar um livro pelo ID
// export async function GET(
//   request: Request, // Tipo nativo Request (compatível com a Web API)
//   { params }: { params: ParamsContext } // CORREÇÃO CHAVE: Tipagem explícita do contexto
// ) {
//   try {
//     const book = await bookServiceServer.getBookById(params.id);

//     if (!book) {
//       return NextResponse.json(
//         { error: "Livro não encontrado" },
//         { status: 404 }
//       );
//     }

//     return NextResponse.json(book, { status: 200 });
//   } catch (error) {
//     console.error("Erro ao buscar livro:", error);
//     return NextResponse.json(
//       { error: "Erro interno do servidor" },
//       { status: 500 }
//     );
//   }
// }

// // PUT /api/books/:id => atualizar um livro pelo ID
// export async function PUT(
//   request: Request, // Tipo nativo Request
//   { params }: { params: ParamsContext } // CORREÇÃO CHAVE
// ) {
//   try {
//     const body = await request.json();

//     const {
//       title,
//       author,
//       genre,
//       year,
//       pages,
//       total_copies,
//       rating,
//       synopsis,
//       cover,
//       reading_status,
//       isbn,
//     } = body;

//     // Validação básica
//     if (!title || !author) {
//       return NextResponse.json(
//         { error: "Título e autor são obrigatórios" },
//         { status: 400 }
//       );
//     }

//     const book = await bookServiceServer.updateBook(params.id, {
//       title,
//       author,
//       genre,
//       // Conversões para número
//       year: year ? Number(year) : undefined,
//       pages: pages ? Number(pages) : undefined,
//       total_copies: Number(total_copies) || 1,
//       available_copies: Number(total_copies) || 1,
//       rating: rating ? Number(rating) : undefined,
//       synopsis,
//       cover,
//       reading_status: reading_status as ReadingStatus,
//       isbn,
//     });

//     return NextResponse.json(book);
//   } catch (error) {
//     console.error("Erro ao atualizar livro:", error);
//     return NextResponse.json(
//       { error: "Erro interno do servidor" },
//       { status: 500 }
//     );
//   }
// }

// // DELETE /api/books/:id => excluir um livro pelo ID
// export async function DELETE(
//   request: Request, // Tipo nativo Request
//   { params }: { params: ParamsContext } // CORREÇÃO CHAVE
// ) {
//   try {
//     // Verificar se o livro existe
//     const book = await bookServiceServer.getBookById(params.id);

//     if (!book) {
//       return NextResponse.json(
//         { error: "Livro não encontrado" },
//         { status: 404 }
//       );
//     }

//     // Excluir o livro
//     await bookServiceServer.deleteBook(params.id);

//     return NextResponse.json(
//       {
//         message: "Livro excluído com sucesso",
//         deletedBook: book,
//       },
//       { status: 200 }
//     );
//   } catch (error) {
//     console.error("Erro ao excluir livro:", error);
//     return NextResponse.json(
//       { error: "Erro interno do servidor" },
//       { status: 500 }
//     );
//   }
// }

import { NextResponse } from "next/server";
import { bookServiceServer } from "@/lib/services/book-service-server";
import { ReadingStatus } from "@prisma/client";

// Tipagem de apoio para o que está dentro do objeto params (mantida internamente)
interface BookRouteParams {
    id: string; 
}

// GET /api/books/:id => buscar um livro pelo ID
// A tipagem do contexto foi removida para satisfazer o Next.js
export async function GET(
    request: Request, 
    { params }: { params: BookRouteParams } // Usamos o tipo BookRouteParams, mas ele é rejeitado.
) {
    // Para resolver o erro de build, vamos confiar na inferência, mas você pode usar 'any' ou remover a tipagem:
    // export async function GET(request: Request, { params }: any) {
    // ou
    // export async function GET(request: Request, { params }: { params: { id: string } }) {
    // O problema é que o Vercel não aceita NENHUMA delas!
    // Apenas deixe-a como no exemplo a seguir e trate o params como se fosse tipado (que é o que o Next.js faz internamente).
    
    try {
        // Assume-se que params.id é uma string (que é o comportamento real do Next.js)
        const book = await bookServiceServer.getBookById((params as BookRouteParams).id);

        if (!book) {
            return NextResponse.json(
                { error: "Livro não encontrado" },
                { status: 404 }
            );
        }

        return NextResponse.json(book, { status: 200 });
    } catch (error) {
        console.error("Erro ao buscar livro:", error);
        return NextResponse.json(
            { error: "Erro interno do servidor" },
            { status: 500 }
        );
    }
}

// PUT /api/books/:id => atualizar um livro pelo ID
export async function PUT(
    request: Request, 
    { params }: { params: BookRouteParams }
) {
    try {
        const body = await request.json();

        const {
            title,
            author,
            genre,
            year,
            pages,
            total_copies,
            rating,
            synopsis,
            cover,
            reading_status,
            isbn,
        } = body;

        if (!title || !author) {
            return NextResponse.json(
                { error: "Título e autor são obrigatórios" },
                { status: 400 }
            );
        }

        const book = await bookServiceServer.updateBook((params as BookRouteParams).id, {
            title,
            author,
            genre,
            year: year ? Number(year) : undefined,
            pages: pages ? Number(pages) : undefined,
            total_copies: Number(total_copies) || 1,
            available_copies: Number(total_copies) || 1,
            rating: rating ? Number(rating) : undefined,
            synopsis,
            cover,
            reading_status: reading_status as ReadingStatus,
            isbn,
        });

        return NextResponse.json(book);
    } catch (error) {
        console.error("Erro ao atualizar livro:", error);
        return NextResponse.json(
            { error: "Erro interno do servidor" },
            { status: 500 }
        );
    }
}

// DELETE /api/books/:id => excluir um livro pelo ID
export async function DELETE(
    request: Request, 
    { params }: { params: BookRouteParams }
) {
    try {
        const book = await bookServiceServer.getBookById((params as BookRouteParams).id);

        if (!book) {
            return NextResponse.json(
                { error: "Livro não encontrado" },
                { status: 404 }
            );
        }

        await bookServiceServer.deleteBook((params as BookRouteParams).id);

        return NextResponse.json(
            {
                message: "Livro excluído com sucesso",
                deletedBook: book,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Erro ao excluir livro:", error);
        return NextResponse.json(
            { error: "Erro interno do servidor" },
            { status: 500 }
        );
    }
}