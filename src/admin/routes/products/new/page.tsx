import React, { useState } from "react"
import { useAdminCreateProduct, useAdminCustomPost } from "medusa-react"
import { useNavigate } from "react-router-dom"
import {
    Button,
    Input,
    Container,
    Heading,
    Label,
    Switch,
    Textarea
} from "@medusajs/ui"
import { RouteConfig } from "@medusajs/admin"

const NewProduct = () => {
    const navigate = useNavigate()
    const { mutateAsync: createProduct } = useAdminCreateProduct()
    const { mutateAsync: createRentalProduct } = useAdminCustomPost(
        `/admin/rental-products`,
        ["admin_rental_products"]
    )

    const [productData, setProductData] = useState({
        title: "",
        description: "",
        handle: "",
        isGiftCard: false,
        discountable: true,
    })
    const [isRental, setIsRental] = useState(false)
    const [rentalData, setRentalData] = useState({
        short_term_rate: 0,
        medium_term_rate: 0,
        long_term_rate: 0,
        rental_periods: {
            short_term: { min: 1, max: 7 },
            medium_term: { min: 8, max: 30 },
            long_term: { min: 31 },
        },
    })

    const handleProductDataChange = (e) => {
        const { name, value } = e.target
        setProductData(prev => ({ ...prev, [name]: value }))
    }

    const handleRentalDataChange = (e) => {
        const { name, value } = e.target
        setRentalData(prev => ({ ...prev, [name]: parseFloat(value) }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            const { product } = await createProduct(
                {
                    title: productData.title,
                    handle: productData.title.toLowerCase().replace(/ /g, "-"),
                    description: "Generated with Rental Product",
                    type: {value: "rental"},
                    variants: [],
                    options: [],
                    is_giftcard: false, discountable: false, collection_id: null, categories: [], tags: []
                },
            )

            if (isRental) {
                await createRentalProduct({
                    product_id: product.id,
                    ...rentalData,
                })
            }

            navigate(`/a/products/${product.id}`)
        } catch (error) {
            console.error("Error creating product:", error)
        }
    }

    return (
        <Container>
            <Heading level="h1" className="mb-4">Create New Product</Heading>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                        id="title"
                        name="title"
                        value={productData.title}
                        onChange={handleProductDataChange}
                        required
                    />
                </div>
                <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                        id="description"
                        name="description"
                        value={productData.description}
                        onChange={handleProductDataChange}
                    />
                </div>
                <div>
                    <Label htmlFor="handle">Handle</Label>
                    <Input
                        id="handle"
                        name="handle"
                        value={productData.handle}
                        onChange={handleProductDataChange}
                    />
                </div>
                <div className="flex items-center">
                    <Switch
                        checked={isRental}
                        onCheckedChange={setIsRental}
                    />
                    <Label className="ml-2">Is this a rental product?</Label>
                </div>
                {isRental && (
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="short_term_rate">Short Term Rate</Label>
                            <Input
                                id="short_term_rate"
                                name="short_term_rate"
                                type="number"
                                value={rentalData.short_term_rate}
                                onChange={handleRentalDataChange}
                            />
                        </div>
                        <div>
                            <Label htmlFor="medium_term_rate">Medium Term Rate</Label>
                            <Input
                                id="medium_term_rate"
                                name="medium_term_rate"
                                type="number"
                                value={rentalData.medium_term_rate}
                                onChange={handleRentalDataChange}
                            />
                        </div>
                        <div>
                            <Label htmlFor="long_term_rate">Long Term Rate</Label>
                            <Input
                                id="long_term_rate"
                                name="long_term_rate"
                                type="number"
                                value={rentalData.long_term_rate}
                                onChange={handleRentalDataChange}
                            />
                        </div>
                    </div>
                )}
                <Button
                    variant="primary"
                    size="large"
                    type="submit"
                >
                    Create Product
                </Button>
            </form>
        </Container>
    )
}

export default NewProduct
