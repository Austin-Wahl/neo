"use client";

import { APIResponse } from "@/app/types/types";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Project } from "@/prisma/generated/prisma";
import calculatePagination from "@/utils/calculate-pagination";
import { useInfiniteQuery } from "@tanstack/react-query";
import { AlertCircle, Bot } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import ProjectCard from "../project-card/project-card";
import ProjectCardLoading from "../project-card/project-card-loading";

const ProjectsGrid = ({
  projects,
  totalRecords,
}: {
  projects?: Project[];
  totalRecords: number;
}) => {
  const { ref, inView } = useInView();
  const [hasNextPage, setHasNextPage] = useState(false);

  const { data, isLoading, isError, isSuccess, fetchNextPage, isFetching } =
    useInfiniteQuery({
      queryKey: ["projects"],
      queryFn: getProjects,
      getNextPageParam: (lastPage) => {
        const metadata = lastPage.pagination.metadata;
        const currentOffset = metadata.skippedRecords;
        const limit = metadata.limit;
        const nextOffset = currentOffset + limit;

        return lastPage.pagination.hasNextPage ? nextOffset : undefined;
      },
      initialPageParam: 0,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      initialData: {
        pages: [
          {
            message: "Projects retrieved!",
            pagination: calculatePagination({
              totalRecords: totalRecords,
              limit: 20,
              offset: 0,
            }),
            items: projects,
          },
        ],
        pageParams: [projects?.length],
      },
    });

  async function getProjects({
    pageParam = 0,
  }: {
    pageParam?: number;
  }): Promise<APIResponse<Project[]>> {
    const res = await fetch(`/api/projects?offset=${pageParam}`);
    if (!res.ok) {
      throw new Error("Failed to fetch projects");
    }

    const body: APIResponse<Project[]> = await res.json();

    return body;
  }

  useEffect(() => {
    if (data?.pages) {
      const lastPage = data.pages[data.pages.length - 1];
      setHasNextPage(lastPage.pagination.hasNextPage);
    }
  }, [data]);

  useEffect(() => {
    if (inView && hasNextPage && !isFetching && hasNextPage) {
      fetchNextPage();
    }
  }, [fetchNextPage, inView, hasNextPage, isFetching]);
  if (isLoading) {
    return (
      <>
        <ProjectCardLoading />
        <ProjectCardLoading />
        <ProjectCardLoading />
      </>
    );
  }

  if (isError) {
    return (
      <Alert variant={"destructive"}>
        <AlertCircle />
        <AlertTitle>Something went wrong.</AlertTitle>
        <AlertDescription>
          NEO failed to retrieve your projects.
        </AlertDescription>
      </Alert>
    );
  }

  if (isSuccess && data.pages[0].items!.length <= 0) {
    return (
      <Alert>
        <Bot />
        <AlertTitle>You do not have any projects!</AlertTitle>
        <AlertDescription>
          Seems like you don&apos;t have any projects created. Create one to
          connect to a database.
        </AlertDescription>
      </Alert>
    );
  }
  if (isSuccess) {
    return (
      <>
        {data.pages.map((page) => {
          return (
            <React.Fragment key={page.pagination.metadata.skippedRecords}>
              {page.items?.map((project) => {
                return <ProjectCard key={project.id} {...project} />;
              })}
            </React.Fragment>
          );
        })}
        {isFetching && (
          <React.Fragment>
            <ProjectCardLoading />
            <ProjectCardLoading />
            <ProjectCardLoading />
          </React.Fragment>
        )}
        <div
          ref={ref}
          className="w-full flex items-center justify-center"
        ></div>
      </>
    );
  }
};

export default ProjectsGrid;
