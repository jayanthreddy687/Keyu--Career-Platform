// create a sign out dialog with confirmation
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "./ui/button";
import { SignOutButton, useClerk } from "@clerk/nextjs";
import { useState } from "react";

const SignOutDialog = () => {
    const { signOut } = useClerk();
    const [loading, setLoading] = useState(false);
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="w-full">
                    Sign Out
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Are you sure you want to sign out?</DialogTitle>
                    <DialogDescription></DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button type="submit" disabled={loading} variant="destructive" onClick={() => {
                        setLoading(true);
                        signOut({ redirectUrl: '/' });
                    }}>{loading ? "Signing Out..." : "Sign Out"}</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default SignOutDialog;
