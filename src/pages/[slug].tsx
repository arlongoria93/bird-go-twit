import { type NextPage, InferGetStaticPropsType, GetStaticProps } from "next";
import { api } from "~/utils/api";
import Head from "next/head";
import Image from "next/image";

const ProfilePage: NextPage = (
  props: InferGetStaticPropsType<typeof getStaticProps>
) => {
  const { data, isLoading } = api.profile.getUserByUserName.useQuery({
    username: "arlongoria93",
  });
  if (isLoading) return <div>Loading...</div>;
  if (!data) return <div>Something went wrong</div>;
  return (
    <>
      <Head>
        <title>{data.username}</title>
        <meta name="description" content="Profile page" />
      </Head>
      <PageLayout>
        <div className="relative h-36  border-slate-400 bg-slate-600">
          <Image
            src={data.profileImageUrl}
            width={128}
            height={128}
            className="absolute bottom-0 left-0 ml-4 -mb-[64px] rounded-full border-4 border-black"
            alt={`${data.username} profile picture`}
          />
        </div>
        <div className="h-[64px]"></div>
        <div className="p-4 text-2xl font-bold">@{data.username}</div>
        <div className="border-b border-slate-400"></div>
      </PageLayout>
    </>
  );
};

import { createProxySSGHelpers } from "@trpc/react-query/ssg";
import { appRouter } from "~/server/api/root";
import { prisma } from "~/server/db";
import superjson from "superjson";
import { PageLayout } from "~/components/layout";

export const getStaticProps: GetStaticProps = async (context) => {
  const ssg = createProxySSGHelpers({
    router: appRouter,
    ctx: { prisma, userId: null },
    transformer: superjson,
  });

  const slug = context.params?.slug;
  if (typeof slug !== "string") {
    throw new Error("Slug is not a string");
  }
  const username = slug.replace("@", "");

  await ssg.profile.getUserByUserName.prefetch({ username });

  return {
    props: {
      trpcState: ssg.dehydrate(),
    },
  };
};

export const getStaticPaths = () => {
  return { paths: [], fallback: "blocking" };
};

export default ProfilePage;
