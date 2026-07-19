const PetCardSkeleton = () => (
  <div className="rounded-2xl overflow-hidden bg-white shadow-soft">
    <div className="skeleton h-56 w-full" />
    <div className="p-5 space-y-3">
      <div className="skeleton h-5 w-2/3 rounded" />
      <div className="skeleton h-4 w-1/2 rounded" />
      <div className="flex gap-2">
        <div className="skeleton h-6 w-16 rounded-full" />
        <div className="skeleton h-6 w-16 rounded-full" />
      </div>
      <div className="skeleton h-9 w-full rounded-xl mt-2" />
    </div>
  </div>
);

export default PetCardSkeleton;
