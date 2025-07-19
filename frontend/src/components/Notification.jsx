export default function Notification({ type, message }) {
  return (
    <div
      className={`p-4 mb-4 rounded ${
        type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
      }`}
    >
      {message}
    </div>
  );
}