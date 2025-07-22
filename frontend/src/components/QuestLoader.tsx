const QuestLoader = () => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-shire-light font-body text-shire-dark">
      <div className="relative mb-6 size-24">
        <div className="absolute inset-0 animate-spin rounded-full border-4 border-shire-moss border-t-shire-pine" />
        <div className="absolute inset-2 animate-pulse rounded-full border-2 border-dashed border-shire-bark" />
      </div>
      <h2 className="mb-2 font-heading text-2xl">Preparing your quest…</h2>
      <p className="text-sm italic text-shire-bark">
        Summoning scrolls, sharpening swords, setting coordinates...
      </p>
    </div>
  )
}

export default QuestLoader
