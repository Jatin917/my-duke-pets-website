const Loader = ({ full = false }) => (
  <div className={`flex items-center justify-center ${full ? 'min-h-[60vh]' : 'py-10'}`}>
    <div className="relative w-12 h-12">
      <div className="absolute inset-0 rounded-full border-4 border-primary-100" />
      <div className="absolute inset-0 rounded-full border-4 border-primary-500 border-t-transparent animate-spin" />
    </div>
  </div>
);

export default Loader;
