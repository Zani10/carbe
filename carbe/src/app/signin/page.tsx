import SignInForm from '@/components/forms/SignInForm';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign In | Carbe',
  description: 'Sign in to your Carbe account',
};

export default function SignIn() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <SignInForm />
    </div>
  );
} 