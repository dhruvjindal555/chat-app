// components/EmailVerificationNotice.js

import { MailCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface EmailVerificationNoticeProps {
    email: string|null;
}


export default function EmailVerificationNotice({ email }: EmailVerificationNoticeProps) {

  const router = useRouter()
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md text-center">
        <div className="flex justify-center mb-4">
          <MailCheck className="w-12 h-12 text-blue-600" />
        </div>
        <h2 className="text-2xl font-semibold mb-2 text-gray-800">Verify Your Email</h2>
        <p className="text-gray-600 mb-4">
          We’ve sent a verification link to <span className="font-medium">{email}</span>.
        </p>
        <p className="text-gray-500 mb-6">Please check your inbox and click the link to continue.</p>
        <button
          onClick={() => router.push('/login')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full font-medium transition"
        >
          I’ve Verified My Email
        </button>
      </div>
    </div>
  );
}
