import { SharedOnlineClasses } from "@/components/dashboard";
import { OnlineClassesProvider } from "@/components/dashboard/online-classes/online-classes-context";

export default function Page() {
  return (
    <OnlineClassesProvider basePath="/teacher/online-classes">
      <SharedOnlineClasses />
    </OnlineClassesProvider>
  );
}
