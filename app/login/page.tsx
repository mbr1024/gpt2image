import LoginForm from '@/components/LoginForm';

export default function LoginPage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-[var(--bg)] px-4">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-[var(--text)]">GPT Image</h1>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">请输入访问密码以继续</p>
      </div>
      <LoginForm />
    </div>
  );
}
