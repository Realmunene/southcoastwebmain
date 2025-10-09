import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

export default function PartnerRegistrationForm() {
  const [form, setForm] = useState({
    supplierType: "",
    supplierName: "",
    mobile: "",
    email: "",
    contactPerson: "",
    password: "",
    confirmPassword: "",
    description: "",
    city: "",
    address: "",
    agree: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(form);
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-red-600 to-red-800 p-4">
      <Card className="w-full max-w-3xl rounded-2xl shadow-lg">
        <CardContent className="p-8">
          <div className="text-center mb-6">
            <img src="/logo.png" alt="viutravel logo" className="mx-auto mb-2 w-40" />
            <p className="text-gray-700 font-semibold">Free Sign Up</p>
            <h2 className="text-2xl font-bold mb-1">Partner Registration</h2>
            <p className="text-red-500 text-sm">This section is for service providers only</p>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Supplier Type</label>
              <Select onValueChange={(value) => setForm({ ...form, supplierType: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select supplier type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="accommodation">Accommodation Provider</SelectItem>
                  <SelectItem value="transport">Transport Provider</SelectItem>
                  <SelectItem value="tour">Tour Operator</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Supplier Name</label>
              <Input name="supplierName" placeholder="Enter your business name" value={form.supplierName} onChange={handleChange} />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Mobile</label>
              <Input name="mobile" placeholder="Format: +254712345678" value={form.mobile} onChange={handleChange} />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Email address</label>
              <Input name="email" type="email" placeholder="Enter your email" value={form.email} onChange={handleChange} />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Contact Person</label>
              <Input name="contactPerson" placeholder="Enter your name" value={form.contactPerson} onChange={handleChange} />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <Input name="password" type="password" placeholder="Enter your password" value={form.password} onChange={handleChange} />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <Input name="description" placeholder="Describe your business" value={form.description} onChange={handleChange} />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Confirm Password</label>
              <Input name="confirmPassword" type="password" placeholder="Repeat your password" value={form.confirmPassword} onChange={handleChange} />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">City</label>
              <Input name="city" placeholder="Enter your city" value={form.city} onChange={handleChange} />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Address</label>
              <Input name="address" placeholder="Enter your address" value={form.address} onChange={handleChange} />
            </div>

            <div className="md:col-span-2 flex items-center mt-2">
              <Checkbox name="agree" checked={form.agree} onCheckedChange={(checked) => setForm({ ...form, agree: checked })} />
              <label className="ml-2 text-sm text-gray-600">
                I accept <a href="#" className="text-blue-600 underline">Terms and Conditions</a>
              </label>
            </div>

            <div className="md:col-span-2 text-center mt-4">
              <Button type="submit" className="w-32 bg-blue-600 hover:bg-blue-700">Sign Up</Button>
              <p className="mt-3 text-sm">
                Already have account? <a href="#" className="text-blue-600 font-semibold">Log In</a>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
