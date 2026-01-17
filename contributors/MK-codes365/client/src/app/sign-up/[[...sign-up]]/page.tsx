import { SignUp } from "@clerk/nextjs";
import AuthLayout from "@/components/AuthLayout";

export default function Page() {
  return (
    <AuthLayout type="sign-up">
      <SignUp
        appearance={{
          elements: {
            formButtonPrimary:
              "bg-blue-600 hover:bg-blue-700 text-sm normal-case",
            card: "shadow-none border-0 bg-transparent p-0",
            headerTitle: "text-2xl font-bold text-gray-900 dark:text-white",
            headerSubtitle: "text-gray-500 dark:text-gray-400",
            socialButtonsBlockButton:
              "border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors",
            footerActionLink: "text-blue-600 hover:text-blue-500 font-semibold",
          },
        }}
      />
    </AuthLayout>
  );
}
