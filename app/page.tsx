import PostButton from "@/components/post-button";
import createPost from "@/server/actions/create-post";
import getPosts from "@/server/actions/get-posts";
import Image from "next/image";

// export const revalidate = 5;
// export const dynamic = "force-dynamic";

export default async function Home() {
	// cookies(); // this will make the page dynamic

	const { error, success } = await getPosts();
	if (error) {
		throw new Error(error);
	}
	console.log(success);
	return (
		<main>
			<h1>Home</h1>
			<p>Posts</p>
			<ul>
				{success.map((post) => (
					<li key={post.id}>
						<h2>{post.title}</h2>
					</li>
				))}
			</ul>
			<form action={createPost}>
				<input
					type="text"
					placeholder="Title"
					name="title"
					className="bg-black"
				/>
				<PostButton />
			</form>
		</main>
	);
}
