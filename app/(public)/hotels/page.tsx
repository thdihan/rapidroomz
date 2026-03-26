import HotelCard from "@/components/hotels/HotelCard";
import SearchBar from "@/components/shared/SearchBar";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import { Checkbox } from "@/components/ui/checkbox";
import {
    Field,
    FieldContent,
    FieldDescription,
    FieldGroup,
    FieldLabel,
    FieldTitle,
} from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import { mockHotels } from "@/data/mocdata";

const amenities = [
    "WiFi",
    "Pool",
    "Spa",
    "Restaurant",
    "Gym",
    "Beach",
    "Bar",
    "Breakfast",
];

type Props = {
    path?: string;
};

function page({ path = "TEST" }: Props) {
    return (
        <div className="">
            <div className="py-6 bg-[#EDF2F7]">
                <div className="container">
                    <SearchBar variant="compact" />
                </div>
            </div>

            <div className="container py-8">
                <div className="flex justify-between">
                    <div>
                        <h3 className="text-2xl font-bold">All Hotels</h3>
                        <p className="text-sm text-muted-foreground">
                            8 hotels found
                        </p>
                    </div>
                    <Select>
                        <SelectTrigger className="w-full max-w-48 py-6">
                            <SelectValue placeholder="Select a fruit" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectLabel>Fruits</SelectLabel>
                                <SelectItem value="apple">Apple</SelectItem>
                                <SelectItem value="banana">Banana</SelectItem>
                                <SelectItem value="blueberry">
                                    Blueberry
                                </SelectItem>
                                <SelectItem value="grapes">Grapes</SelectItem>
                                <SelectItem value="pineapple">
                                    Pineapple
                                </SelectItem>
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex py-4 gap-8">
                    <div className="flex-1 space-y-4">
                        {/* Price Range  */}
                        <div>
                            <p className="text-sm font-bold mb-2">
                                Price Range
                            </p>
                            <div className="flex gap-4">
                                <Input
                                    type="number"
                                    placeholder="Min"
                                    className="focus-visible:ring-primary rounded-sm py-5 "
                                />
                                <Input
                                    type="number"
                                    placeholder="Max"
                                    className="focus-visible:ring-primary rounded-sm py-5"
                                />
                            </div>
                        </div>

                        {/* Amenities  */}
                        <div>
                            <p className="text-sm font-bold mb-2">Amenities</p>

                            <div>
                                <FieldGroup className="max-w-sm">
                                    {amenities.map((amenity, index) => (
                                        <Field
                                            key={index}
                                            orientation="horizontal"
                                        >
                                            <Checkbox
                                                id={amenity}
                                                name={amenity}
                                                className="border-primary mr-2"
                                            />
                                            <Label htmlFor={amenity}>
                                                {amenity}
                                            </Label>
                                        </Field>
                                    ))}
                                </FieldGroup>
                            </div>
                        </div>
                    </div>

                    <div className="flex-3">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                            {mockHotels?.map((m, index) => (
                                <HotelCard hotel={m} key={index} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default page;
