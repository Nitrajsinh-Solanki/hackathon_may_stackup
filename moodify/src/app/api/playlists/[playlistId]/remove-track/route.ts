// hackathon_may_stackup\moodify\src\app\api\playlists\[playlistId]\remove-track\route.ts


import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import connectToDatabase from "@/lib/db";
import User from "@/models/User";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export async function POST(
  request: NextRequest,
  { params }: { params: { playlistId: string } }
) {
  try {
    // verifying authentication
    const token = (await cookies()).get("auth_token")?.value;
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: string;
      email: string;
      username: string;
    };

    if (!decoded.userId) {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }

    const playlistId = params.playlistId;

    // getting request body
    const body = await request.json();
    const { trackId } = body;

    if (!trackId) {
      return NextResponse.json(
        { message: "Track ID is required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const user = await User.findById(decoded.userId);
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // finding the playlist
    const playlistIndex = user.createdPlaylists.findIndex(
      (playlist: { _id: { toString: () => string } }) =>
        playlist._id.toString() === playlistId
    );

    if (playlistIndex === -1) {
      return NextResponse.json(
        { message: "Playlist not found" },
        { status: 404 }
      );
    }

    const trackIndex = user.createdPlaylists[playlistIndex].tracks.findIndex(
      (track: { trackId: string }) => track.trackId === trackId
    );

    if (trackIndex === -1) {
      return NextResponse.json(
        { message: "Track not found in playlist" },
        { status: 404 }
      );
    }

    // removing the track from the playlist
    user.createdPlaylists[playlistIndex].tracks.splice(trackIndex, 1);
    user.createdPlaylists[playlistIndex].updatedAt = new Date();

    await user.save();

    return NextResponse.json({
      message: "Track removed from playlist successfully",
      playlist: user.createdPlaylists[playlistIndex],
    });
  } catch (error: any) {
    console.error("Remove track from playlist error:", error);
    return NextResponse.json(
      { message: error.message || "Failed to remove track from playlist" },
      { status: 500 }
    );
  }
}
