import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { SignIn, SignInButton, SignOutButton, useUser } from "@clerk/nextjs";
import { api, RouterOutputs } from "~/utils/api";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Image from "next/image";
import { LoadingPage } from "~/components/loading";
import { toast } from "react-hot-toast";

dayjs.extend(relativeTime);

const CreatePostWizard = () => {
  const { user } = useUser();
  const ctx = api.useContext();
  const { mutate: createPost, isLoading } = api.posts.create.useMutation({
    onSuccess: () => {
      ctx.posts.getAll.invalidate();
    },
    onError: () => {
      toast.error("Are you using Emoji's 🤔🤔?");
    },
  });

  if (!user) return null;

  return (
    <div className="flex w-full gap-3">
      <Image
        alt="author profile picture"
        src={user.profileImageUrl}
        className="h-14 w-14 rounded-full"
        width={56}
        height={56}
      />
      <input
        placeholder="Type some emojis"
        className="grow bg-transparent outline-none"
        disabled={isLoading}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            createPost({
              content: e.currentTarget.value,
            });
            e.currentTarget.value = "";
          }
        }}
      />
    </div>
  );
};
type PostWithUser = RouterOutputs["posts"]["getAll"][number];
const PostView = (props: PostWithUser) => {
  const { post, author } = props;
  if (!post || !author) return null;
  return (
    <div className="flex items-center gap-3 border-b border-slate-400 p-4">
      <Image
        alt="author profile picture"
        width={56}
        height={56}
        src={author.profileImageUrl}
        className="h-14 w-14 rounded-full"
      />
      <div className="flex flex-col">
        <div className="flex gap-1">
          <span className="font-bold">@{author.username}</span>
          <span>·</span>
          <span className="font-thin text-slate-400">{`${dayjs(
            post.createdAt
          ).fromNow()}`}</span>
        </div>
        <span className="text-2xl"> {post.content}</span>
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
      {data.map(({ post, author }) => (
        <PostView key={post.id} post={post} author={author} />
      ))}
    </div>
  );
};

const Home: NextPage = (props) => {
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
