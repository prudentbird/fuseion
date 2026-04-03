import AppLoader from "~/components/app-loader";

export default function Loading() {
  return (
    <AppLoader
      className="bg-[#2a2a2a]/96"
      spinnerClassName="border-white/15 border-t-white"
    />
  );
}
