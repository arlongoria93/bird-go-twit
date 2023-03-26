import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { SignIn, SignInButton, SignOutButton, useUser } from "@clerk/nextjs";
import { api, RouterOutputs } from "~/utils/api";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Image from "next/image";
import { LoadingPage } from "~/components/loading";

dayjs.extend(relativeTime);

const CreatePostWizard = () => {
  const { user } = useUser();
  if (!user) return null;

  return (
    <div className="flex w-full gap-3">
      <Image
        alt="author profile picture"
        src={user.profileImageUrl}
        className="h-24 rounded-full"
        width={96}
        height={96}
      />
      <input
        placeholder="Type some emojis"
        className="grow bg-transparent outline-none"
      />
    </div>
  );
};
type PostWithUser = RouterOutputs["posts"]["getAll"][number];
const PostView = (props: PostWithUser) => {
  const { post, author } = props;
  if (!post || !author) return null;
  return (
    <div className="flex gap-3 border-b border-slate-400 p-4">
      <Image
        alt="author profile picture"
        width={96}
        height={96}
        src={author.profileImageUrl}
        className="h-24 rounded-full"
      />
      <div className="flex flex-col">
        <div className="flex gap-1">
          <span className="font-bold">@{author.username}</span>
          <span>·</span>
          <span className="font-thin text-slate-400">{`${dayjs(
            post.createdAt
          ).fromNow()}`}</span>
        </div>
        <span> {post.content}</span>
      </div>
    </div>
  );
};

const Feed = () => {
  const { data, isLoading: postsLoaded } = api.posts.getAll.useQuery();
  if (postsLoaded) return <LoadingPage />;
  if (!data) return <div>Something went wrong</div>;
  return (
    <div className="flex flex-col">
      {data?.map(({ post, author }) => (
        <PostView key={post.id} post={post} author={author} />
      ))}
    </div>
  );
};

const Home: NextPage = () => {
  const { isLoaded: userLoaded, isSignedIn } = useUser();
  api.posts.getAll.useQuery();
  if (!userLoaded) return <div />;
  return (
    <>
      <Head>
        <title>Create T3 App</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex h-screen justify-center">
        <div className="w-full border-x border-slate-400  md:max-w-2xl">
          <div className="flex border-b border-slate-400 p-4 ">
            {!isSignedIn && (
              <div className="flex justify-center">
                <SignInButton />
              </div>
            )}
            {isSignedIn && <CreatePostWizard />}
          </div>
          <Feed />
        </div>
      </main>
    </>
  );
};

export default Home;
