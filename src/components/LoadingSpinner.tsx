export default function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="w-10 h-10 border-4 border-gray-200 border-t-green-500 rounded-full animate-spin" />
      <p className="mt-4 text-gray-500">Loading jerseys...</p>
    </div>
  );
}
