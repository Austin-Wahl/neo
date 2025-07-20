"use client";
import {
  Action,
  Actions,
  IJsonModel,
  Layout,
  Model,
  Node,
  TabSetNode,
} from "flexlayout-react";
import {
  createContext,
  ReactNode,
  RefObject,
  useEffect,
  useRef,
  useState,
} from "react";

interface StudioLayout {
  model: Model;
  save: (model: Model) => void;
  layoutRef: RefObject<Layout | null> | null;
  addView: (view: View) => string;
  removeView: (viewId: string) => void;
  activeViews: Record<string, View>;
  getActiveView: () => TabSetNode | undefined;
}

export type View = "Editor" | "Results" | "Scratchpad" | "Graph";

const defaultModelJson: IJsonModel = {
  global: {},
  borders: [],
  layout: {
    type: "row",
    weight: 100,
    children: [
      {
        type: "row",
        weight: 30,
        children: [
          {
            type: "tabset",
            weight: 50,
            children: [
              {
                type: "random",
                name: "Random",
              },
            ],
          },
          // {
          //   type: "tabset",
          //   weight: 50,
          //   children: [
          //     {
          //       type: "editor",
          //       name: "Editor",
          //     },
          //   ],
          // },
        ],
      },
      {
        type: "tabset",
        weight: 50,
        children: [
          {
            type: "tab",
            name: "Results",
          },
        ],
      },
    ],
  },
};

export const StudioLayoutContext = createContext<StudioLayout>({
  model: Model.fromJson(defaultModelJson),
  save: () => {},
  layoutRef: null,
  addView: () => {
    return "";
  },
  removeView: () => {},
  activeViews: {},
  getActiveView: () => undefined,
});

const StudioLayoutProvider = ({ children }: { children: ReactNode }) => {
  const layoutFile = "neo-user-layout";
  const layoutRef = useRef<Layout>(null);
  const [model, setModel] = useState<Model>(Model.fromJson(defaultModelJson));
  const [activeViews, setActiveViews] = useState<Record<string, View>>({});

  function getActiveView(): TabSetNode | undefined {
    return model.getActiveTabset();
  }

  function addView(view: View): string {
    if (layoutRef.current) {
      const tabNode = layoutRef.current.addTabToActiveTabSet({
        name: view,
      });

      if (tabNode) {
        setActiveViews((prev) => ({
          ...prev,
          [tabNode.getId()]: view,
        }));
        return tabNode.getId();
      }
      return "";
    } else {
      console.error(
        "Can not apply layout. Please ensure 'layoutRef' is assigned to a flexlayout-react Layour element!"
      );
      return "";
    }
  }

  function removeView(viewId: string) {
    if (layoutRef.current) {
      const node = model.getNodeById(viewId);

      if (node) {
        model.doAction(Actions.deleteTab(node.getId()));
        setActiveViews((prev) => {
          if (!prev) return prev;
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { [viewId]: _, ...rest } = prev;
          return rest;
        });
      } else {
        console.error(`View with ID '${viewId}' does not exist in the layout.`);
      }
    } else {
      console.error(
        "Can not apply layout. Please ensure 'layoutRef' is assigned to a flexlayout-react Layout element!"
      );
    }
  }

  // On load
  useEffect(() => {
    // Get layout
    const json = localStorage.getItem(layoutFile);

    // Save default layout and load it if one is not stored in LS
    if (!json) {
      console.warn("No MODEL loaded. STUDIO is attempting to load");
      const stringifiedModel = save(Model.fromJson(defaultModelJson));
      load(stringifiedModel);
    } else {
      load(json!);
    }
  }, []);

  // Handles changes in the Layout
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const handleModelChange = (action: Action) => {
      const updatedModelJson = model.toJson();
      save(Model.fromJson(updatedModelJson));
    };
    model.addChangeListener(handleModelChange);
  }, [model]);

  const save = (model: Model): string => {
    const jsonStr = JSON.stringify(model.toJson(), null, "\t");
    localStorage.setItem(layoutFile, jsonStr);
    return jsonStr;
  };

  // Loads layout from localstorage
  const load = (jsonText: string) => {
    const json = JSON.parse(jsonText);
    const model = Model.fromJson(json);

    const views = traverse(model.getRoot());
    setActiveViews((prev) => ({ ...prev, ...Object.assign({}, ...views) }));
    setModel(model);
  };

  function traverse(node: Node): Array<Record<string, View>> {
    let res: Array<Record<string, View>> = [];

    if (node.getType() === "tab") {
      res.push({ [node.getId()]: node.getAttr("name") });
    } else if (node.getChildren()) {
      node.getChildren().forEach((child) => {
        res = res.concat(traverse(child));
      });
    }

    return res;
  }

  // Listen for changes in model and apply them to LS
  useEffect(() => {
    if (model) {
      save(model);
    }
  }, [model]);

  useEffect(() => {
    console.warn("ACTIVE VIEWS", activeViews);
  }, [activeViews]);

  return (
    <StudioLayoutContext.Provider
      value={{
        model,
        save,
        addView,
        layoutRef,
        removeView,
        activeViews,
        getActiveView,
      }}
    >
      {children}
    </StudioLayoutContext.Provider>
  );
};

export default StudioLayoutProvider;
