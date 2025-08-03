"use client";
import {
  Action,
  Actions,
  IJsonModel,
  Layout,
  Model,
  Node,
  TabNode,
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
  activeView: TabNode | null;
  openViews: Array<TabNode>;
  layoutRef: RefObject<Layout | null> | null;
  addView: (
    viewType: View,
    config?: Record<string, unknown>
  ) => TabNode | undefined;
  updateViewConfig: (
    viewId: string,
    config: Record<string, unknown>,
    reset?: boolean
  ) => TabNode | undefined;
}

export type View = "Editor" | "Results" | "Scratchpad" | "Graph" | "Debug";

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
                type: "tab",
                name: "Editor",
                component: "Editor",
              },
            ],
          },
        ],
      },
      {
        type: "tabset",
        weight: 50,
        children: [
          {
            type: "tab",
            name: "Results",
            component: "Results",
          },
        ],
      },
    ],
  },
};

export const StudioLayoutContext = createContext<StudioLayout>({
  model: Model.fromJson(defaultModelJson),
  activeView: null,
  openViews: [],
  layoutRef: null,
  addView: () => undefined,
  updateViewConfig: () => undefined,
});

const StudioLayoutProvider = ({ children }: { children: ReactNode }) => {
  const layoutFile = "neo-user-layout";
  const layoutRef = useRef<Layout>(null);

  const [model, setModel] = useState<Model>(Model.fromJson(defaultModelJson));
  const [activeView, setActiveView] = useState<TabNode | null>(null);
  const [openViews, setOpenViews] = useState<Array<TabNode>>([]);
  const openViewRef = useRef<Array<TabNode>>([]);

  // Listens for changes in the open views and  updates state
  useEffect(() => {
    // Update openViews whenever the model changes
    const updateOpenViews = () => {
      const views = traverse(model.getRoot());
      openViewRef.current = views;
      setOpenViews(views);
    };

    // Run initially to populate openViews
    updateOpenViews();

    // Listen for changes in the model
    const handleModelChange = (action: Action) => {
      if (
        action.type === "FlexLayout_AddNode" ||
        action.type === "FlexLayout_DeleteTab"
      ) {
        updateOpenViews();
      }
    };

    model.addChangeListener(handleModelChange);

    // Cleanup the listener on unmount
    return () => {
      model.removeChangeListener(handleModelChange);
    };
  }, [model]);

  function getActiveView(): TabNode | null {
    if (layoutRef.current) {
      const activeTabset = model.getActiveTabset();

      if (activeTabset) {
        const activeTabId = activeTabset.getSelectedNode();
        if (!activeTabId) return null;
        const activeTabNode = model.getNodeById(activeTabId.getId());

        if (activeTabNode) {
          return activeTabNode as TabNode;
        } else {
          console.error("No active tab found in the active tabset.");
          return null;
        }
      } else {
        if (openViews) {
          return openViews[0] as TabNode;
        }
        console.error("No active tabset found.");
        return null;
      }
    } else {
      console.error(
        "Can not retrieve active view. Please ensure 'layoutRef' is assigned to a flexlayout-react Layout element!"
      );
      return null;
    }
  }
  // Listen for changes in the active view and update the state
  useEffect(() => {
    const handleModelChange = () => {
      const activeView = getActiveView();
      setActiveView(activeView);
    };

    // Add the change listener
    model.addChangeListener(handleModelChange);

    // Cleanup the listener on unmount
    return () => {
      model.removeChangeListener(handleModelChange);
    };
  }, [model]);

  // Handles changes in the Layout
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const handleModelChange = (action: Action) => {
      console.warn("CHANGE IN LAYOUT");
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
    setModel(model);
  };

  function traverse(node: Node): Array<TabNode> {
    let res: Array<TabNode> = [];

    if (node.getType() === "tab") {
      res.push(node as TabNode);
    } else if (node.getChildren()) {
      node.getChildren().forEach((child) => {
        res = res.concat(traverse(child));
      });
    }

    return res;
  }

  // Listen for changes in model and apply them to LS
  // useEffect(() => {
  //   if (model) {
  //     save(model);
  //   }
  // }, [model]);

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

  /**
   * Adds a new view to the currently selected tabset
   * @param viewType Type of view
   * @param config Extra data for a view
   */
  function addView(
    viewType: View,
    config?: Record<string, unknown>
  ): TabNode | undefined {
    try {
      if (!layoutRef.current) {
        throw new Error("Layout Ref does not exist");
      }

      // Get the active tabset
      let activeTabset = model.getActiveTabset();

      if (!activeTabset) {
        console.warn("No active tabset found. Searching for existing tabset.");

        // Before creating a tabset, check if one exists. Then just select that one by the ID
        if (openViews) {
          const firstTabsetInstance = model
            .getRoot()
            .getChildren()
            .find((node) => node.getType() === "tabset") as TabSetNode;

          model.doAction(Actions.setActiveTabset(firstTabsetInstance.getId()));

          activeTabset = firstTabsetInstance;
        } else {
          console.warn("No tabset was found. Creating a new Tabset.");

          // Create a new tabset with a default tab
          const newTabsetId = `tabset-${Date.now()}`;
          const newTabId = `tab-${Date.now()}`;

          const newTabset = {
            type: "tabset",
            id: newTabsetId,
            children: [
              {
                type: "tab",
                id: newTabId,
                name: viewType,
                component: viewType,
                config,
              },
            ],
          };

          // Update the model directly
          const updatedModelJson = model.toJson();
          updatedModelJson.layout.children.push(newTabset); // Add the new tabset to the layout

          // Create a new model instance with the updated JSON
          const updatedModel = Model.fromJson(updatedModelJson);
          setModel(updatedModel); // Update the state with the new model

          // Set the new tabset as active
          updatedModel.doAction(Actions.setActiveTabset(newTabsetId));

          // Return the newly created tab
          return updatedModel.getNodeById(newTabId) as TabNode;
        }
      }

      // If an active tabset exists, add a new tab to it
      const newTab = layoutRef.current.addTabToActiveTabSet({
        component: viewType,
        name: viewType,
        config,
      });

      return newTab;
    } catch (error) {
      console.error(`Failed to get or create View of type ${viewType}`, error);
    }
  }

  const updateViewConfig = (
    viewId: string,
    config: Record<string, unknown>,
    reset?: boolean
  ) => {
    try {
      console.log("Updating config");
      if (!layoutRef.current) {
        throw new Error("Layout Ref does not exist");
      }

      const activeView = model.getNodeById(viewId) as TabNode;
      if (!activeView) {
        console.warn("Failed to update view config. This view does not exist.");
        return undefined;
      }

      if (reset) {
        model.doAction(
          Actions.updateNodeAttributes(viewId, {
            config: { ...config },
          })
        );
      } else {
        model.doAction(
          Actions.updateNodeAttributes(viewId, {
            config: { ...activeView.getConfig(), ...config },
          })
        );
      }

      setModel(model);

      console.log("Updated view:", model.getNodeById(viewId));
      return model.getNodeById(viewId) as TabNode;
    } catch (error) {
      console.error(
        `Failed to update the config for View with view ID ${viewId}`,
        error
      );
    }
  };
  return (
    <StudioLayoutContext.Provider
      value={{
        model,
        activeView,
        openViews: openViewRef.current,
        layoutRef,
        addView,
        updateViewConfig,
      }}
    >
      {children}
    </StudioLayoutContext.Provider>
  );
};

export default StudioLayoutProvider;
