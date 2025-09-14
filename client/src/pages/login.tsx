import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { setAuthToken } from "@/lib/auth";

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isLogin, setIsLogin] = useState(true);

  const loginMutation = useMutation({
    mutationFn: async (data: { email: string; password: string }) =>
      apiRequest('POST', '/api/auth/login', data),
    onSuccess: async (response) => {
      const data = await response.json();
      console.log("Login successful, token:", data.token);
      setAuthToken(data.token);
      console.log("Token set in localStorage:", localStorage.getItem('auth_token'));
      await queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
      toast({ title: "Welcome back!" });
      // Small delay to allow auth state to update
      setTimeout(() => {
        console.log("Navigating to dashboard...");
        setLocation('/dashboard');
      }, 100);
    },
    onError: () => {
      toast({ title: "Login failed", description: "Invalid credentials", variant: "destructive" });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: { username: string; email: string; password: string }) =>
      apiRequest('POST', '/api/auth/register', data),
    onSuccess: async (response) => {
      const data = await response.json();
      console.log("Registration successful, token:", data.token);
      setAuthToken(data.token);
      console.log("Token set in localStorage:", localStorage.getItem('auth_token'));
      await queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
      toast({ title: "Account created successfully!" });
      // Small delay to allow auth state to update
      setTimeout(() => {
        console.log("Navigating to dashboard...");
        setLocation('/dashboard');
      }, 100);
    },
    onError: () => {
      toast({ title: "Registration failed", description: "User may already exist", variant: "destructive" });
    },
  });

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    loginMutation.mutate({
      email: formData.get('email') as string,
      password: formData.get('password') as string,
    });
  };

  const handleRegister = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    registerMutation.mutate({
      username: formData.get('username') as string,
      email: formData.get('email') as string,
      password: formData.get('password') as string,
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xl">C</span>
            </div>
          </div>
          <CardTitle className="text-2xl">CodeQuest</CardTitle>
          <CardDescription>Welcome to the coding practice platform</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={isLogin ? "login" : "register"} onValueChange={(value) => setIsLogin(value === "login")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login" data-testid="tab-login">Login</TabsTrigger>
              <TabsTrigger value="register" data-testid="tab-register">Register</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    data-testid="input-email"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    required
                    data-testid="input-password"
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={loginMutation.isPending}
                  data-testid="button-login"
                >
                  {loginMutation.isPending ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    name="username"
                    required
                    data-testid="input-username"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-email">Email</Label>
                  <Input
                    id="reg-email"
                    name="email"
                    type="email"
                    required
                    data-testid="input-reg-email"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-password">Password</Label>
                  <Input
                    id="reg-password"
                    name="password"
                    type="password"
                    required
                    data-testid="input-reg-password"
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={registerMutation.isPending}
                  data-testid="button-register"
                >
                  {registerMutation.isPending ? "Creating account..." : "Create Account"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
