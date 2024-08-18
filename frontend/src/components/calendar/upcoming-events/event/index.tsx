import React from "react";

import { useNavigation } from "@refinedev/core";
import type { GetFieldsFromList } from "@refinedev/nestjs-query";

import { Badge } from "antd";
import dayjs from "dayjs";

import type { UpcomingEventsQuery } from "@/graphql/types";

import { Text } from "../../../text";
import styles from "../index.module.css";

type CalendarUpcomingEventProps = {
  item: GetFieldsFromList<UpcomingEventsQuery>;
};

export const CalendarUpcomingEvent: React.FC<CalendarUpcomingEventProps> = ({
    item,
}) => {
    const { show } = useNavigation();
    const { _id, title, startDate, endDate, color } = item;
    const isToday = dayjs.utc(startDate).isSame(dayjs.utc(), "day");
    const isTomorrow = dayjs
        .utc(startDate)
        .isSame(dayjs.utc().add(1, "day"), "day");
    // const isAllDayEvent = 
    //     dayjs.utc(startDate).startOf("day").isSame(startDate) &&
    //     dayjs.utc(endDate).endOf("day").isSame(endDate);

    const renderDate = () => {
        if(isToday) {
            return "Today";
        }

        if (isTomorrow) {
            return "Tomorrow";
        }

        return dayjs(startDate).format("MMM DD");
    };

    const renderTime = () => {
        const utcStartDate = dayjs(startDate).utc();
        const utcEndDate = dayjs(endDate).utc();
        if (utcEndDate.diff(utcStartDate, "hours") >= 23) {
            return "All day";
        }
        return `${dayjs(utcStartDate).format("HH:mm a")} - ${dayjs(utcEndDate).format("HH:mm a")}`;
    };

    return (
        <div
            onClick={() => {
                show("events", item._id);
            }}
            key={_id}
            className={styles.item}
        >
            <div className={styles.date}>
                <Badge color={color} className={styles.badge} />
                <Text size="xs">{`${renderDate()}, ${renderTime()}`}</Text>
            </div>
            <Text ellipsis={{ tooltip: true }} strong className={styles.title}>
                {title}
            </Text>
        </div>
    )
}