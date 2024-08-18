import { useEffect } from "react";

import { useForm, useSelect } from "@refinedev/antd";
import { type HttpError, useInvalidate } from "@refinedev/core";
import type { GetFields, GetFieldsFromList } from "@refinedev/nestjs-query";

import { FlagOutlined } from "@ant-design/icons";
import { Checkbox, Form, Select, Space } from "antd";

import type { Task } from "@/graphql/schema.types";
import type {
  KanbanGetTaskQuery,
  TaskStagesSelectQuery,
} from "@/graphql/types";

import { AccordionHeaderSkeleton } from "../accordion-header-skeleton";
import { TASK_STAGES_SELECT_QUERY } from "./queries";

type KanbanTask = GetFields<KanbanGetTaskQuery>;

type Props = {
  initialValues: {
    completed: KanbanTask["completed"];
    stage: KanbanTask["stage"];
  };
  isLoading?: boolean;
};

export const StageForm = ({ initialValues, isLoading }: Props) => {
    const invalidate = useInvalidate();
    const { formProps } = useForm<Task, HttpError, Task>({
        queryOptions: {
        enabled: true,
        },
        autoSave: {
            enabled: true,
            debounce: 0,
            onFinish: (values) => {
                console.log("stageId", values)
                return {
                    ...values,
                    stage: undefined,
                    stageId: values.stage?._id,
                };
            },
        },
        onMutationSuccess: () => {
        invalidate({ invalidates: ["list"], resource: "tasks" });
        },
    });

    const { selectProps, queryResult } = useSelect<GetFieldsFromList<TaskStagesSelectQuery>>({
        resource: "taskStages",
        meta: {
            gqlQuery: TASK_STAGES_SELECT_QUERY,
        },
    });

    useEffect(() => {
        formProps.form?.setFieldsValue(initialValues);
    }, [initialValues.completed, initialValues.stage]);

    if (isLoading) {
        return <AccordionHeaderSkeleton />;
    }

    return (
        <div style={{ padding: "12px 24px", borderBottom: "1px solid #d9d9d9" }}>
            <Form
                layout="inline"
                style={{
                    justifyContent: "space-between",
                    alignItems: "center",
                }}
                {...formProps}
                initialValues={initialValues}
            >
                <Space size={5}>
                    {/* @ts-expect-error Ant Design Icon's v5.0.1 has an issue with @types/react@^18.2.66 */}
                    <FlagOutlined />
                    <Form.Item noStyle name={["stage", "_id"]} >
                        <Select 
                            popupMatchSelectWidth={false}
                            options={
                                queryResult.data?.data?.map((stage) => ({
                                    label: stage.title,
                                    value: stage._id
                                })).concat([{
                                    label: "Unassigned",
                                    value: "",
                                }])
                            }
                            bordered={false}
                            showSearch={false}
                            placeholder="Select a stage"
                            onSearch={undefined}
                            size="small"
                        />
                    </Form.Item>
                    <Form.Item noStyle name="completed" valuePropName="checked">
                        <Checkbox>Mark as complete</Checkbox>
                    </Form.Item>
                </Space>
            </Form>
        </div>
    )
}