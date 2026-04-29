import { DueCountBanner } from "@/components/DueCountBanner";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <h1 className="mb-10">Learning Uzbek</h1>

      <p className="text-2xl mb-5">Test your Uzbek vocabulary skills!</p>

      <DueCountBanner />

      <div className="mt-6">
        <Link href="/timed-test">
          <button className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-500 transition text-sm">
            Timed Test (legacy)
          </button>
        </Link>
      </div>
    </>
  );
}
