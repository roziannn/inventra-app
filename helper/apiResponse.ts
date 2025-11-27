// utils/apiResponse.ts
import { NextResponse } from "next/server";

export const apiResponse = {
  success: <T>(data: T, status: number = 200) => {
    return NextResponse.json({ success: true, data }, { status });
  },

  error: (message: string, status: number = 500) => {
    return NextResponse.json({ success: false, message }, { status });
  },

  badRequest: (message: string = "Bad Request") => {
    return NextResponse.json({ success: false, message }, { status: 400 });
  },

  notFound: (message: string = "Not Found") => {
    return NextResponse.json({ success: false, message }, { status: 404 });
  },
};
