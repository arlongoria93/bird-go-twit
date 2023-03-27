import { type NextPage } from "next";
import Head from "next/head";

import { SignIn, SignInButton, SignOutButton, useUser } from "@clerk/nextjs";
const PostView: NextPage = (props) => {
  return (
    <>
      <Head>
        <title>Bird Go Twit</title>
        <meta name="description" content="Explain yourself with emojis" />
      </Head>
      <main className="flex h-screen justify-center">
        <div>Post View</div>
      </main>
    </>
  );
};

export default PostView;
