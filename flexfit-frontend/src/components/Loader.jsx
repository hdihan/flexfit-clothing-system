import { Loader2 } from 'lucide-react';
export default function Loader() {
    return (
        <div className="flex justify-center items-center py-20">
            <Loader2 className="animate-spin text-brand-600" size={40} />
        </div>
    );
}