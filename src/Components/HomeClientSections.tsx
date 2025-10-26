"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";

const SocialLinks = dynamic(() => import("@/Components/SocialLinks"));
const AboutSection = dynamic(() => import("@/Components/AboutSection"));
const BlogSection = dynamic(() => import("@/Components/BlogSection"));
const SubscribeForm = dynamic(() => import("@/Components/SubscribeForm"));

export default function HomeClientSections() {
    return (
        <>
            <Suspense fallback={<div>Đang tải...</div>}>
                <SocialLinks />
            </Suspense>
            <section className="grid md:grid-cols-3 gap-8 mt-8">
                <Suspense fallback={<div>Đang tải...</div>}>
                    <AboutSection />
                </Suspense>
                <Suspense fallback={<div>Đang tải...</div>}>
                    <BlogSection />
                </Suspense>
                <Suspense fallback={<div>Đang tải...</div>}>
                    <SubscribeForm />
                </Suspense>
            </section>
        </>
    );
}
