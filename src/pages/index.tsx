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
import { PageLayout } from "~/components/layout";
import { PostView } from "~/components/postview";

dayjs.extend(relativeTime);

const CreatePostWizard = () => {
  const { user } = useUser();
  const ctx = api.useContext();
  const { mutate: createPost, isLoading } = api.posts.create.useMutation({
    onSuccess: () => {
      void ctx.posts.getAll.invalidate();
    },
    onError: (e) => {
      const errorMessage = e.data?.zodError?.fieldErrors?.content;
      if (errorMessage && errorMessage[0]) toast.error(errorMessage[0]);
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

const Feed = () => {
  const { data, isLoading: postsLoading } = api.posts.getAll.useQuery();

  if (postsLoading)
    return (
      <div className="flex grow">
        <LoadingPage />
      </div>
    );

  if (!data) return <div>Something went wrong</div>;

  return (
    <div className="flex grow flex-col overflow-y-scroll">
      {[...data, ...data, ...data, ...data].map((fullPost) => (
        <PostView {...fullPost} key={fullPost.post.id} />
      ))}
    </div>
  );
};

const Home: NextPage = (props) => {
  const { isLoaded: userLoaded, isSignedIn } = useUser();
  api.posts.getAll.useQuery();
  if (!userLoaded) return <div />;
  return (
    <PageLayout>
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
    </PageLayout>
  );
};

export default Home;
