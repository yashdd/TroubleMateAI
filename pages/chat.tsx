import { useRouter } from "next/router";
import ChatUI from "../components/ChatUI";
import { useState, useEffect } from "react";
import { supabase } from '../utils/supabaseClient';
import React from "react";

export default function ChatPage(){
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchUser = async () => {
            const {data:{session},error,}  = await supabase.auth.getSession();
             if (error || !session) {
                router.push("/login"); // not logged in
            } else {
                setUser(session.user);
            }
            setLoading(false);
        };
        fetchUser();
    }, [router]);
         if (loading) {
            return <p style={{ textAlign: "center", marginTop: "2rem" }}>Loading chat...</p>;
        }

         return user ? <ChatUI user={user} /> : null;



    

}