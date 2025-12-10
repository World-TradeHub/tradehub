import React, { useState,useEffect } from "react";
import { useWorldApp } from "@/contexts/WorldAppContext";
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import { MiniKit } from '@worldcoin/minikit-js';
import { User, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getDefaultCountry } from "@/lib/utils";
import { API_URL } from "@/config/config";

export default function Login() {
  const { login } = useWorldApp();
  const navigate = useNavigate();

  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // useEffect(() => {
  //    autoLoginDevUser();
  // }, []);

  // const autoLoginDevUser = async () => {
  //   setIsLoading(true);
  //   await login(
  //     {
  //       walletAddress: "test_user",
  //       username: "test_user",
  //       profilePictureUrl: "",
  //     },
  //     "dev_nonce_value"
  //   );
  //   navigate("/");
  // };



  const handleSignIn = async () => {
    try {


      try {

        if (!MiniKit.isInstalled()) {
          toast({
            title: "MiniKit Not Installed",
            description: "You need to run app inside worldapp",
          });
          return
        }
      }
      catch (error) {
        toast({
          title: "MiniKit Not Installed",
          description: "You need to run app inside worldapp",
        });
        return
      }


      setIsLoading(true);




      console.log("MiniKit is installed");



      const res = await fetch(`${API_URL}/api/v1/nonce`,
        {
          credentials: "include",
          method: 'GET',
          headers: {
            "Content-Type": "application/json",
          },
        }
      )
      const { nonce } = await res.json()


      if (!nonce) throw new Error("An error occurred. Please try again.");


      const { finalPayload } = await MiniKit.commandsAsync.walletAuth({
          nonce: nonce,
          requestId: '0',
          expirationTime: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000),
          notBefore: new Date(new Date().getTime() - 24 * 60 * 60 * 1000),
          statement: 'Loggin in with Worldapp',
      })

      if (finalPayload.status === 'error') {
          return
      } else {
          let userInfo = await MiniKit.getUserInfo();


          await login({
              walletAddress: userInfo.walletAddress,
              username: userInfo.username,
              profilePictureUrl: userInfo.profilePictureUrl,
          },
              nonce
          );

      }

       toast({
        title: "Connected!",
        description: "Successfully connected with your wallet",
      });


      //   await login({
      //   walletAddress: "randomwallet_address_ccc",
      //   username: "random_username_cc",
      //   profilePictureUrl: ""
      // },
      //   nonce
      // );

      await getDefaultCountry(false);



      navigate('/');


    } catch (err) {
      console.error(`Sign-in failed: ${err}.  ${err instanceof Error ? err.message : String(err)}`);
      toast({
        title: `Sign-in Failed ${err instanceof Error ? err.message : String(err)}`,
        description: err instanceof Error ? err.message : String(err),
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 pb-20">
      <div className="text-center max-w-sm">
        <div className="w-24 h-24 rounded-full bg-gradient-primary flex items-center justify-center mx-auto mb-6">
          <User size={40} className="text-white" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Welcome to ShopHub
        </h2>
        <p className="text-muted-foreground mb-6">
          Connect with your wallet to start buying and selling securely
        </p>
        <Button
          onClick={handleSignIn}
          disabled={isLoading}
          className="bg-gradient-primary hover:shadow-glow w-full flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin" size={18} />
              Connecting...
            </>
          ) : (
            "Connect Wallet"
          )}
        </Button>
      </div>
    </div>
  );
}
