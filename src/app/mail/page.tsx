import { Mail } from 'lucide-react';

const MailPage = () => {
  return (
    <div className="flex flex-1 flex-col items-center justify-center rounded-lg border border-dashed shadow-sm h-[80vh]">
      <div className="flex flex-col items-center gap-4 text-center">
        <Mail className="h-16 w-16 text-muted-foreground" />
        <h1 className="text-4xl font-bold tracking-tight">Coming Soon</h1>
        <p className="text-lg text-muted-foreground">
          We're working hard to bring you a fully integrated mail experience.
        </p>
      </div>
    </div>
  );
};

export default MailPage;
