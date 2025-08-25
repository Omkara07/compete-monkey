import Navbar from "@/components/navigation/navbar";

export default function Home() {

  return (
    <div className="flex flex-col items-center w-screen h-screen">
      <div className="flex w-full fixed top-0 justify-center z-50">
        <Navbar />
      </div>
      <div className="flex w-full justify-center py-30 mt-20">
        <h1 className="md:text-8xl text-5xl justify-center flex font-bold text-center text-neutral-400">
          Welcome to Compete Monkey
        </h1>
      </div>
    </div>
  );
}
