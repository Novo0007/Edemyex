
'use server';

import { notFound } from 'next/navigation';
import CheckoutForm from './checkout-form';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

function CheckoutSkeleton() {
    return (
        <div className="container mx-auto max-w-4xl px-4 py-8">
            <Skeleton className="h-10 w-3/4 mx-auto mb-8" />
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div>
                    <div className="space-y-3">
                        <Skeleton className="h-48 w-full" />
                        <Skeleton className="h-5 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                    </div>
                 </div>
                 <div>
                     <div className="space-y-6">
                        <div className="space-y-2">
                             <Skeleton className="h-4 w-1/4" />
                             <Skeleton className="h-10 w-full" />
                        </div>
                         <div className="space-y-2">
                             <Skeleton className="h-4 w-1/4" />
                             <Skeleton className="h-10 w-full" />
                        </div>
                         <div className="space-y-2">
                             <Skeleton className="h-4 w-1/4" />
                             <Skeleton className="h-10 w-full" />
                        </div>
                         <Skeleton className="h-11 w-full" />
                     </div>
                 </div>
            </div>
        </div>
    )
}


export default async function CheckoutPage({ params }: { params: { id: string } }) {
  const { id } = params;
  if (!id) {
    notFound();
  }

  return (
    <Suspense fallback={<CheckoutSkeleton />}>
      <CheckoutForm courseId={id} />
    </Suspense>
  );
}
