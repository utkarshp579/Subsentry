import { SignInButton, SignUpButton } from "@clerk/nextjs";

export default function Home() {
  return (
    <main>
      <h1>Subsentry</h1>
      <SignInButton />
      <SignUpButton />
    </main>
  );
}
