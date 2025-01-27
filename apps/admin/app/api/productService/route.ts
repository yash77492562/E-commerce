import { NextRequest, NextResponse } from "next/server";
import { ProductUploadService } from "../../../src/services/productService";

export async function POST(req: NextRequest) {  // Remove res parameter as it's not needed
    try {
        const body = await req.json();  // Change res.json() to req.json()
        const {productData,uploadFiles,s3Config} = body
        if(!productData && !uploadFiles){
            return NextResponse.json({success:false,message:"productData and files is needed"})
        }
        const productService = new ProductUploadService(s3Config)
        const createdProduct = await productService.createProductWithImages(
            productData,
            uploadFiles
        );
        if(createdProduct){
            return NextResponse.json(
                { success: true, message: "Product created successfully" },
                { status: 200 }
            );
        }else{
            return NextResponse.json({success:false,message:"Error while creating your product"},{status:500})
        }

    } catch (error) {
        console.error('procuct_creation error', error);  // Added error logging
        return NextResponse.json(
            { success: false, message: "Trouble while uploading  your data" },
            { status: 500 }
        );
    }
}