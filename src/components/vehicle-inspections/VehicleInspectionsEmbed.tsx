type VehicleInspectionsEmbedProps = {
  src: string;
};

export function VehicleInspectionsEmbed({ src }: VehicleInspectionsEmbedProps) {
  return (
    <div className="-mt-[76px] min-h-[calc(100vh-76px)] sm:-mt-[80px] sm:min-h-[calc(100vh-80px)]">
      <iframe
        title="Auto Verifi Vehicle Inspection Services"
        src={src}
        className="h-[calc(100vh-76px)] w-full border-0 sm:h-[calc(100vh-80px)]"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>
  );
}
