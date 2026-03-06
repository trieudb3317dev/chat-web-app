import Image from "next/image";
import AuthLayout from "./(auth)/layout";
import SignIn from "./(auth)/sign-in/page";

export default function Home() {
  return (
    // <main className="flex min-h-screen flex-col items-center justify-between p-24">
    //     <h1 className="text-4xl font-bold">Welcome to Next.js 14!</h1>

    // </main>
    <AuthLayout>
      <SignIn />
    </AuthLayout>
  );
}
