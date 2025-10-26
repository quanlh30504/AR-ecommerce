import { Check, Lock } from "lucide-react";
import React from 'react';


export const CheckIcon = (props: React.ComponentProps<'svg'>) => (
    <Check className="h-4 w-4 mr-1" {...props} />
);

export const LockIcon = (props: React.ComponentProps<'svg'>) => (
    <Lock className="h-4 w-4 mr-1" {...props} />
);
