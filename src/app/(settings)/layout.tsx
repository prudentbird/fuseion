import { SettingsHeader } from "~/components/settings/header";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="w-full max-w-[1200px] mx-auto flex flex-col px-4 md:px-6 lg:px-8 pt-6 pb-24 overflow-y-auto">
      <SettingsHeader />
      {children}
    </div>
  );
}
