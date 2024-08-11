// src/admin/routes/rental-products/register/[productId]/page.tsx
import {useNavigate, useParams} from "react-router-dom"
import { useAdminProduct, useAdminCustomPost } from "medusa-react"
import { useState } from "react"
import {
    Button,
    Container,
    Heading,
    Label,
    Input,
    Text
} from "@medusajs/ui"
import {RouteConfig} from "@medusajs/admin";
import {Product} from "@medusajs/medusa";

// RentalProduct 타입 정의 추가
type RentalProduct = {
    id: string;
    product_id: string;
    product: Product;
    short_term_rate: number;
    medium_term_rate: number;
    long_term_rate: number;
    rental_periods: {
        short_term: { min: number; max: number };
        medium_term: { min: number; max: number };
        long_term: { min: number };
    };
}

const RegisterRentalProductPage = () => {
    const { productId } = useParams()
    const { product } = useAdminProduct(productId)
    const [rentalData, setRentalData] = useState<Omit<RentalProduct, 'id' | 'product_id' | 'product'>>({
        short_term_rate: 0,
        medium_term_rate: 0,
        long_term_rate: 0,
        rental_periods: {
            short_term: { min: 1, max: 7 },
            medium_term: { min: 8, max: 30 },
            long_term: { min: 31 },
        }
    })

    const navigate = useNavigate()

    const { mutate: registerRentalProduct, isLoading } = useAdminCustomPost(
        `/admin/rental-products`,
        ["rental_product"]
    )

    const handleRegister = () => {
        registerRentalProduct({
            product_id: productId,
            ...rentalData
        }, {
            onSuccess: () => {
                // Redirect to product detail page
                navigate(`/a/products/${productId}`)
            }
        })
    }

    if (!product) return <Text>Loading...</Text>

    return (
        <Container>
            <Heading level="h1">Register Rental Product</Heading>
            <Text>Product: {product.title}</Text>
            <div className="space-y-4">
                <div>
                    <Label htmlFor="short-term-rate">Short Term Rate</Label>
                    <Input
                        id="short-term-rate"
                        type="number"
                        value={rentalData.short_term_rate}
                        onChange={(e) => setRentalData({...rentalData, short_term_rate: Number(e.target.value)})}
                    />
                </div>
                <div>
                    <Label htmlFor="medium-term-rate">Medium Term Rate</Label>
                    <Input
                        id="medium-term-rate"
                        type="number"
                        value={rentalData.medium_term_rate}
                        onChange={(e) => setRentalData({...rentalData, medium_term_rate: Number(e.target.value)})}
                    />
                </div>
                <div>
                    <Label htmlFor="long-term-rate">Long Term Rate</Label>
                    <Input
                        id="long-term-rate"
                        type="number"
                        value={rentalData.long_term_rate}
                        onChange={(e) => setRentalData({...rentalData, long_term_rate: Number(e.target.value)})}
                    />
                </div>
                <Button
                    variant="primary"
                    size="small"
                    onClick={handleRegister}
                    disabled={isLoading}
                >
                    Register Rental Product
                </Button>
            </div>
        </Container>
    )
}

export default RegisterRentalProductPage
