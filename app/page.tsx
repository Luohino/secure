"use client";
import dynamic from 'next/dynamic';

const SecureChat = dynamic(() => import('../components/SecureChat'), {
  ssr: false,
});

export default function Page() {
  return <SecureChat />;
}
