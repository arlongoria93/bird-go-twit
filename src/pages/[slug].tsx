import { type NextPage, InferGetStaticPropsType, GetStaticProps } from "next";
import { api } from "~/utils/api";
import Head from "next/head";

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
      <main className="flex h-screen justify-center">{data.username}</main>
    </>
  );
};

import { createProxySSGHelpers } from "@trpc/react-query/ssg";
import { appRouter } from "~/server/api/root";
import { prisma } from "~/server/db";
import superjson from "superjson";

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

export const getStaticPaths = async () => {
  return { paths: [], fallback: "blocking" };
};

export default ProfilePage;
