import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 gap-4">
      <p className="text-4xl font-bold text-gray-300">404</p>
      <p className="text-sm text-gray-500">页面不存在</p>
      <Link
        href="/create"
        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
      >
        返回首页
      </Link>
    </div>
  );
}