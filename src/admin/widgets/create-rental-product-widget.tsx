import {WidgetConfig, ProductDetailsWidgetProps} from "@medusajs/admin"
import {useAdminCustomQuery, useAdminCustomPost} from "medusa-react"
import {useState, useEffect} from "react"
import {
    Button,
    Container,
    Heading,
    Label,
    Input,
    Text,
    Textarea
} from "@medusajs/ui"
import {useNavigate} from "react-router-dom"
import {RentalProduct} from "../../models/rental-product";

const RentalProductWidget = ({product}: ProductDetailsWidgetProps) => {
    const navigate = useNavigate()
    const [isEditing, setIsEditing] = useState(false)
    const [isConfirming, setIsConfirming] = useState(false)
    const [rentalData, setRentalData] = useState({
        short_term_rate: 0,
        medium_term_rate: 0,
        long_term_rate: 0,
        rentPlace: "",
        returnPlace: ""
    })

    const {data: rentalInfo, isLoading, refetch} = useAdminCustomQuery<{ rental_product: RentalProduct }>(
        `/admin/rental-products/product/${product.id}`,
        ["admin_rental_products", product.id]
    )

    const {mutate: updateRentalInfo, isLoading: isUpdating} = useAdminCustomPost(
        `/admin/rental-products/product/${product.id}`,
        ["rental_product", product.id]
    )

    const {mutate: initializeRentalInfo, isLoading: isInitializing} = useAdminCustomPost(
        `/admin/rental-products/initialize/${product.id}`,
        ["rental_product", product.id]
    )

    useEffect(() => {
        if (rentalInfo && rentalInfo.rental_product) {
            setRentalData({
                short_term_rate: rentalInfo.rental_product.short_term_rate,
                medium_term_rate: rentalInfo.rental_product.medium_term_rate,
                long_term_rate: rentalInfo.rental_product.long_term_rate,
                rentPlace: rentalInfo.rental_product.rentPlace || "",
                returnPlace: rentalInfo.rental_product.returnPlace || ""
            })
        }
    }, [rentalInfo])

    const handleUpdate = () => {
        setIsConfirming(true)
    }

    const confirmUpdate = () => {
        updateRentalInfo(rentalData, {
            onSuccess: () => {
                setIsEditing(false)
                setIsConfirming(false)
                refetch()
            }
        })
    }

    const handleInitialize = () => {
        initializeRentalInfo(rentalData, {
            onSuccess: () => {
                refetch()
            }
        })
    }

    if (isLoading) return <Text>Loading...</Text>

    const rental_product = rentalInfo?.rental_product

    if (rental_product === null) {
        return (
            <Container>
                <Heading level="h2">Rental Information</Heading>
                <Text>This product is not registered for rental.</Text>
                <Button
                    variant="primary"
                    size="small"
                    onClick={() => navigate(`/a/rental-products/register/${product.id}`)}
                >
                    Register as Rental Product
                </Button>
            </Container>
        )
    }

    if (isEditing) {
        return (
            <Container>
                <Heading level="h2">Edit Rental Information</Heading>
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
                    <div>
                        <Label htmlFor="rent-place">Rent Place</Label>
                        <Textarea
                            id="rent-place"
                            value={rentalData.rentPlace}
                            onChange={(e) => setRentalData({...rentalData, rentPlace: e.target.value})}
                        />
                    </div>
                    <div>
                        <Label htmlFor="return-place">Return Place</Label>
                        <Textarea
                            id="return-place"
                            value={rentalData.returnPlace}
                            onChange={(e) => setRentalData({...rentalData, returnPlace: e.target.value})}
                        />
                    </div>
                    {!isConfirming ? (
                        <Button
                            variant="primary"
                            size="small"
                            onClick={handleUpdate}
                        >
                            Update Rental Information
                        </Button>
                    ) : (
                        <div className="space-y-2">
                            <Text>Are you sure you want to update the rental information?</Text>
                            <div className="space-x-2">
                                <Button
                                    variant="primary"
                                    size="small"
                                    onClick={confirmUpdate}
                                    disabled={isUpdating}
                                >
                                    Confirm Update
                                </Button>
                                <Button
                                    variant="secondary"
                                    size="small"
                                    onClick={() => setIsConfirming(false)}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    )}
                    <Button
                        variant="secondary"
                        size="small"
                        onClick={() => {
                            setIsEditing(false)
                            setIsConfirming(false)
                        }}
                    >
                        Cancel Editing
                    </Button>
                </div>
            </Container>
        )
    }

    return (
        <Container>
            <Heading level="h2">Rental Information</Heading>
            <div className="space-y-2">
                <Text>Short Term Rate: {rental_product.short_term_rate}</Text>
                <Text>Medium Term Rate: {rental_product.medium_term_rate}</Text>
                <Text>Long Term Rate: {rental_product.long_term_rate}</Text>
                <Text>Rent Place: {rental_product.rentPlace}</Text>
                <Text>Return Place: {rental_product.returnPlace}</Text>
            </div>
            <div className="space-x-2 mt-4">
                <Button
                    variant="secondary"
                    size="small"
                    onClick={() => setIsEditing(true)}
                >
                    Edit Rental Information
                </Button>
                <Button
                    variant="secondary"
                    size="small"
                    onClick={handleInitialize}
                    disabled={isInitializing}
                >
                    Initialize from Product
                </Button>
            </div>
        </Container>
    )
}

export const config: WidgetConfig = {
    zone: "product.details.after",
}

export default RentalProductWidget
