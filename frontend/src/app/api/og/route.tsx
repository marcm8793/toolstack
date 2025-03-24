import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  // Get the tool details from the query params
  const title = searchParams.get("title") || "ToolStack";
  const description =
    searchParams.get("description")?.substring(0, 100) ||
    "Developer Tools Collection";
  const logoUrl = searchParams.get("logo") || "";
  const category = searchParams.get("category") || "";
  const ecosystem = searchParams.get("ecosystem") || "";
  const githubStars = searchParams.get("github_stars") || "";

  try {
    // Fetch the logo image
    let logoImage: ArrayBuffer | null = null;
    if (logoUrl) {
      try {
        const logoRes = await fetch(logoUrl);
        logoImage = await logoRes.arrayBuffer();
      } catch (error) {
        console.error("Error fetching logo:", error);
      }
    }

    // Fetch the ToolStack logo
    let toolstackLogoImage: ArrayBuffer | null = null;
    try {
      const toolstackLogoRes = await fetch(
        new URL("/ToolStack.png", request.url).toString()
      );
      toolstackLogoImage = await toolstackLogoRes.arrayBuffer();
    } catch (error) {
      console.error("Error fetching ToolStack logo:", error);
    }

    // Generate the OG image
    return new ImageResponse(
      (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            height: "100%",
            backgroundColor: "#0F172A", // dark blue background
            padding: "40px",
            fontFamily: "sans-serif",
            position: "relative",
          }}
        >
          {/* Gradient background */}
          <div
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              width: "50%",
              height: "50%",
              background:
                "radial-gradient(circle at top right, rgba(59, 130, 246, 0.3), transparent 70%)",
            }}
          />

          {/* ToolStack Brand */}
          <div
            style={{
              display: "flex",
              position: "absolute",
              top: "40px",
              left: "40px",
              alignItems: "center",
            }}
          >
            {toolstackLogoImage && (
              <img
                src={toolstackLogoImage as unknown as string}
                alt="ToolStack"
                width={48}
                height={48}
              />
            )}
            <span
              style={{
                marginLeft: "10px",
                fontSize: "1.5rem",
                fontWeight: "600",
                backgroundImage: "linear-gradient(to bottom, #3b82f6, #1e3a8a)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                textShadow: "0 0 10px rgba(59, 130, 246, 0.5)",
                borderRadius: "10px",
                padding: "5px 10px",
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                backdropFilter: "blur(10px)",
              }}
            >
              ToolStack
            </span>
          </div>

          <div
            style={{
              display: "flex",
              width: "100%",
              alignItems: "center",
              justifyContent: "center",
              padding: "20px",
            }}
          >
            {/* Tool Logo */}
            {logoImage && (
              <div
                style={{
                  width: "120px",
                  height: "120px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: "40px",
                }}
              >
                <img
                  src={logoImage as unknown as string}
                  alt={title}
                  width={100}
                  height={100}
                  style={{
                    objectFit: "contain",
                    borderRadius: "12px",
                  }}
                />
              </div>
            )}

            {/* Text Content */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                justifyContent: "center",
                flex: 1,
              }}
            >
              <div
                style={{
                  fontSize: "48px",
                  fontWeight: "bold",
                  color: "white",
                  marginBottom: "8px",
                  lineHeight: 1.2,
                }}
              >
                {title}
              </div>

              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "8px",
                  marginBottom: "12px",
                }}
              >
                {category && (
                  <div
                    style={{
                      backgroundColor: "rgba(59, 130, 246, 0.2)",
                      color: "#60A5FA",
                      borderRadius: "4px",
                      padding: "4px 12px",
                      fontSize: "18px",
                    }}
                  >
                    {category}
                  </div>
                )}

                {ecosystem && (
                  <div
                    style={{
                      backgroundColor: "rgba(139, 92, 246, 0.2)",
                      color: "#A78BFA",
                      borderRadius: "4px",
                      padding: "4px 12px",
                      fontSize: "18px",
                    }}
                  >
                    {ecosystem}
                  </div>
                )}

                {githubStars && (
                  <div
                    style={{
                      backgroundColor: "rgba(251, 191, 36, 0.2)",
                      color: "#FBBF24",
                      borderRadius: "4px",
                      padding: "4px 12px",
                      fontSize: "18px",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                        fill="#FBBF24"
                        stroke="#FBBF24"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    {Number(githubStars).toLocaleString()}
                  </div>
                )}
              </div>

              <div
                style={{
                  fontSize: "24px",
                  color: "#94A3B8",
                  lineHeight: 1.4,
                }}
              >
                {description}
              </div>
            </div>
          </div>

          {/* ToolStack Footer */}
          <div
            style={{
              position: "absolute",
              bottom: "40px",
              right: "40px",
              fontSize: "18px",
              color: "#60A5FA",
            }}
          >
            toolstack.pro
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (error) {
    console.error("Error generating OG image:", error);

    // Fallback to a simple image
    return new ImageResponse(
      (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            height: "100%",
            backgroundColor: "#0F172A",
            color: "white",
            padding: "40px",
            fontFamily: "sans-serif",
          }}
        >
          <div
            style={{
              fontSize: "64px",
              fontWeight: "bold",
              color: "#3B82F6",
              marginBottom: "16px",
            }}
          >
            ToolStack
          </div>
          <div
            style={{
              fontSize: "32px",
              color: "#94A3B8",
            }}
          >
            Developer Tools Collection
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  }
}
