"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter, DrawerClose } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import SubscriptionForm from "./SubscriptionForm";

export default function AddSubscriptionDrawer() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const handleSuccess = () => {
    setOpen(false);
    router.refresh();
  };

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <PlusCircle className="mr-2 h-4 w-4" />
        Add Subscription
      </Button>

      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent className="max-w-[540px] ml-auto border-l bg-white rounded-none shadow-xl">
          <DrawerHeader className="p-6 bg-blue-600 text-white">
            <DrawerTitle className="text-xl font-semibold">Add New Subscription</DrawerTitle>
            <DrawerDescription className="text-blue-100 text-sm">
              Track and manage your recurring expenses
            </DrawerDescription>
          </DrawerHeader>

          <div className="p-6">
            <SubscriptionForm onSuccess={handleSuccess} />
          </div>

          <DrawerFooter className="p-4">
            <DrawerClose asChild>
              <Button variant="outline" className="w-full">Cancel</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
}
